"use strict";

const { check, validationResult } = require("express-validator");
var models = require("../models");
const comentario = models.comentario;
const cuenta = models.cuenta;
var persona = models.persona;
var rol = models.rol;

class PersonaControl {
  async listar(req, res) {
    var lista = await persona.findAll({
      attributes: [
        "nombres",
        "apellidos",
        "direccion",
        "celular",
        "fecha_nac",
        "external_id",
        "id_rol",
      ],
    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async obtenerUsuario(req, res) {
    const external = req.params.external;

    var lista = await persona.findOne({
      where: { external_id: external },
      attributes: [
        "nombres",
        "apellidos",
        "direccion",
        "celular",
        "fecha_nac",
      ],
      
    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async crear(req, res) {
    var UUID = require("uuid");
    var rolId = await rol.findOne({
      where: { external_id: req.body.id_rol },
    });

    // Lista de campos permitidos
    const camposPermitidos = [
      "nombres",
      "apellidos",
      "direccion",
      "celular",
      "fecha_nac",
      "correo",
      "clave",
      "id_rol",
    ];

    // Verificar que solo se envíen campos permitidos
    const camposEnviados = Object.keys(req.body);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (
      camposInvalidos.length > 0 ||
      !camposPermitidos.every((campo) => camposEnviados.includes(campo))
    ) {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "Campos no permitidos o incompletos",
        code: 400,
      });
      return;
    } else {
      console.log(rolId);
      let transaction = await models.sequelize.transaction();
      try {
        if (rolId !== undefined && rolId !== null) {
          console.log(rolId.external_id);
          var result = await persona.create(
            {
              nombres: req.body.nombres,
              apellidos: req.body.apellidos,
              direccion: req.body.direccion,
              celular: req.body.celular,
              fecha_nac: req.body.fecha_nac,
              cuenta: {
                correo: req.body.correo,
                clave: req.body.clave,
              },
              id_rol: rolId.id,
              external_id: UUID.v4(),
            },
            {
              include: [
                {
                  model: models.cuenta,
                  as: "cuenta",
                },
              ],
              transaction,
            }
          );
          await transaction.commit();
          if (result === null) {
            res.status(401);
            res.json({
              msg: "ERROR",
              tag: "NO se pudo crear",
              code: 401,
            });
          } else {
            rolId.external_id = UUID.v4();
            await rolId.save();
            res.status(200);
            res.json({
              msg: "OK",
              code: 200,
              data: result,
            });
          }
        } else {
          res.status(401);
          res.json({
            msg: "ERROR",
            tag: "No se encuentra Rol",
            code: 401,
          });
        }
      } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(203);
        res.json({
          msg: "ERROR",
          tag: "la cuenta ya existe",
          code: 401,
          error_msg: error,
        });
      }
    }
  }

  async validarUsuario(req, res, next) {
    console.log("valdiacioens")
    await check("nombres").notEmpty().withMessage("El campo nombres es obligatorio").run(req);

    // Obtiene los resultados de las validaciones
    const errors = validationResult(req);
    console.log(errors)
  
    // Verifica si hay errores
    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: "ERROR",
        tag: "Credenciales Invalidas",
        code: 401,
        errors: errors.array(),
      });
    }
  
    // Si no hay errores, pasa al siguiente middleware o controlador
    next();
  }

  async usuario(req, res) {
    var UUID = require("uuid");
    var rolId = await rol.findOne({
      where: { id: "2" },
    });

    // Lista de campos permitidos
    const camposPermitidos = ["nombres", "apellidos", "correo", "clave"];

    // Verificar que solo se envíen campos permitidos
    const camposEnviados = Object.keys(req.body);
    const camposInvalidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (
      camposInvalidos.length > 0 ||
      !camposPermitidos.every((campo) => camposEnviados.includes(campo))
    ) {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "Campos no permitidos o incompletos",
        code: 400,
      });
      return;
    } else {
      console.log(rolId);
      let transaction = await models.sequelize.transaction();
      try {
        if (rolId !== undefined && rolId !== null) {
          console.log(rolId.external_id);
          var result = await persona.create(
            {
              nombres: req.body.nombres,
              apellidos: req.body.apellidos,
              cuenta: {
                correo: req.body.correo,
                clave: req.body.clave,
              },
              id_rol: rolId.id,
              external_id: UUID.v4(),
            },
            {
              include: [
                {
                  model: models.cuenta,
                  as: "cuenta",
                },
              ],
              transaction,
            }
          );
          await transaction.commit();
          if (result === null) {
            res.status(401);
            res.json({
              msg: "ERROR",
              tag: "NO se pudo crear",
              code: 401,
            });
          } else {
            rolId.external_id = UUID.v4();
            await rolId.save();
            res.status(200);
            res.json({
              msg: "OK",
              code: 200,
              data: result,
            });
          }
        } else {
          res.status(401);
          res.json({
            msg: "ERROR",
            tag: "No se encuentra Rol",
            code: 401,
          });
        }
      } catch (error) {
        if (transaction) await transaction.rollback();
        res.status(203);
        res.json({
          msg: "ERROR",
          tag: "la cuenta ya existe",
          code: 401,
          error_msg: error,
        });
      }
    }
  }

  async banear(req, res){
    const external = req.params.external;

    var usuario= await persona.findOne({
      where: { external_id: external },
    })
    console.log(usuario);

    var cuentaA= await cuenta.findOne({
      where: { id_persona: usuario.id },
    })
    console.log(cuentaA);   
    var comentarios=await comentario.findAll({
      where: { id_persona: usuario.id },

    })
    console.log(comentarios)

    cuentaA.estado=req.body.estado;
    await cuentaA.save();

    for (const comentario of comentarios) {
      comentario.estado = req.body.estado;
      await comentario.save();
    }

    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: comentarios, // Cambié result por lista, ya que result no estaba definido
    });
    





  }

  async update(req, res) {
    const external = req.params.external;
    
    var lista = await persona.findOne({
      where: { external_id: external },
      /* attributes: [
        "nombres",
        "apellidos",
        "direccion",
        "celular",
        "fecha_nac",
//        "id_rol",
        ],
      */
    });

  

    lista.nombres = req.body.nombres || lista.nombres;
    lista.apellidos = req.body.apellidos || lista.apellidos;
    lista.direccion = req.body.direccion || lista.direccion;
    lista.celular = req.body.celular || lista.celular;
    lista.fecha_nac = req.body.fecha_nac || lista.fecha_nac;
  

    await lista.save();
   

    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista, // Cambié result por lista, ya que result no estaba definido
    });
  }
}
module.exports = PersonaControl;
