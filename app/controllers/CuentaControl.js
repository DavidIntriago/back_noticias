"use strict";

var models = require("../models");
var rol = models.rol;
var persona = models.persona;
var cuenta = models.cuenta;
let jwt = require("jsonwebtoken");
/*
instalar
npm install jsonwebtoken --save
npm install doteenv --save
*/

class CuentaControl {
  async listar(req, res) {
    var lista = await cuenta.findAll({
      attributes: ["correo", "clave", "estado", ["external_id", "id"]],

    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async validarGerente(req, res) {
    res.status(200);
    res.json({
      msg: "Es gerente",
      code: 200
    });
  }

  async inicio_sesion(req, res) {
    if (req.body.hasOwnProperty("correo") && 
    req.body.hasOwnProperty("clave")) {
        console.log("entraaaaaaa")
      let cuentaA = await cuenta.findOne({
        where: {
          correo: req.body.correo,
        },include: [
            {
              model: models.persona,
              as: "persona",
              attributes: ["apellidos", "nombres", "external_id"],
            },
          ],
      });
      if (cuentaA === null) {
        res.status(400);
        res.json({
          msg: "ERROR",
          tag: "cuenta no existe",
          code: 400,
        });
      } else {
        if (cuentaA.estado == true) {
          if (cuentaA.clave === req.body.clave) {
            const token_data = {
              external: cuentaA.external_id,
              check: true,
            };
            console.log(token_data)
            require("dotenv").config();
            const key = process.env.KEY;
            const token = jwt.sign(token_data, key, {
              expiresIn: "2h",
            });
            var info = {
              token: token,
              user: cuentaA.persona.apellidos + " " + cuentaA.persona.nombres,
              external_id: cuentaA.persona.external_id,
            };
            res.status(200);
            res.json({
              msg: "OK",
              tag: "Listi",
              code: 200,
              data: info
            });
          } else {
            res.status(400);
            res.json({
              msg: "ERROR",
              tag: "clave incorrecta",
              code: 400,
            });
          }
        } else {
          res.status(400);
          res.json({
            msg: "ERROR",
            tag: "cuuenta desactivada",
            code: 400,
          });
        }
      }
    } else {
      res.status(400);
      res.json({
        msg: "ERROR",
        tag: "falta dara",
        code: 400,
      });
    }
  }
}

module.exports = CuentaControl;
