"use strict";
const { Sequelize } = require("sequelize");

var formidable = require("formidable");
var models = require("../models");
var fs = require("fs");
var noticia = models.noticias;
var persona = models.persona;
var comentario = models.comentario;

var extensiones = ["png"];

class ComentarioControl {
  async listar(req, res) {
    var lista = await comentario.findAll({
      where: {estado:true},
      include: [
        {
          model: models.noticias,
          as: "noticia",
          attributes: ["titulo", "fecha", "external_id"],
        },
        {
          model: models.persona,
          as: "persona",
          attributes: ["nombres", "apellidos"],
        },
      ],
      attributes: [
        "cuerpo",
        "estado",
        "fecha",
        "latitud",
        "longitud",
        "external_id",
      ],
    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async obtener_noticia(req, res) {
    const external = req.params.external;
    const i = 1; // comienza en uno
    const fin = 10; // Tamaño a mostarr
  
    console.log(external);
  
    try {
      const lista = await noticia.findOne({
        where: { external_id: external },
      });
  
      if (!lista) {
        return res.status(200).json({
          msg: "OK",
          code: 200,
          data: [],
        });
      }
  
      const comentarios = await comentario.findAndCountAll({
        where: { id_noticia: lista.id, estado: true },
        include: [
          {
            model: models.noticias,
            as: "noticia",
            attributes: ["titulo", "fecha", "external_id"],
          },
          {
            model: models.persona,
            as: "persona",
            attributes: ["nombres", "apellidos","external_id"],
          },
        ],
        attributes: [
          "id",
          "cuerpo",
          "estado",
          "fecha",
          "latitud",
          "longitud",
          "external_id",
        ],
        order: [['id', 'DESC']], // Ordenar por id en orden descendente
        offset: (i - 1) * fin,
        limit: fin,
      });
  
      res.status(200).json({
        msg: "OK",
        code: 200,
        data: comentarios.rows,
        pagination: {
          totalItems: comentarios.count,
          totalis: Math.ceil(comentarios.count / fin),
          currenti: i,
          fin: fin,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        msg: "Internal Server Error",
        code: 500,
        error: error.message,
      });
    }
  }
  

  async obtener_usuario(req, res) {
    const external = req.params.external;
    var lista = await persona.findOne({
      where: { external_id: external },
    });

    console.log("la listaa");

    console.log(lista);
    var comentarios = await comentario.findAll({
      where: { id_persona: lista.id },
      include: [
        {
          model: models.noticias,
          as: "noticia",
          attributes: ["titulo", "fecha", 'external_id'],
        },
        {
          model: models.persona,
          as: "persona",
          attributes: ["nombres", "apellidos"],
        },
      ],
      attributes: [
        "cuerpo",
        "estado",
        "fecha",
        "latitud",
        "longitud",
        "external_id",
      ],
    });
    if (lista === undefined || lista === null) {
      res.status(200);
      res.json({
        msg: "OK",
        code: 200,
        data: [],
      });
    } else {
      res.status(200);
      res.json({
        msg: "OK",
        code: 200,
        data: comentarios,
      });
    }
  }

  async modificar(req, res) {
    var external = req.params.external;
    var comentario_id = await comentario.findOne({
      where: { external_id: external },
    });

    comentario_id.cuerpo = req.body.cuerpo;
    comentario_id.fecha = Sequelize.fn("NOW");
    (comentario_id.latitud = req.body.latitud),
      (comentario_id.longitud = req.body.longitud);

    await comentario_id.save();
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: comentario_id,
    });
  }

  async crear(req, res) {
    var UUID = require("uuid");
    var noticiaId = await noticia.findOne({
      where: { external_id: req.body.id_noticia },
    });

    var usuarioId = await persona.findOne({
      where: { external_id: req.body.id_persona },
    });
    //console.log(usuarioId)

    /*
    // Lista de campos permitidos
    const camposPermitidos = [
      "cuerpo",
      "estado",
      "fecha",
      "longitud",
      "latitud",
      "usuario",
      "id_noticia",
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
      */
    if (noticiaId !== undefined && noticiaId !== null) {
      var result = await comentario.create({
        id_noticia: noticiaId.id,
        cuerpo: req.body.cuerpo,
        estado: req.body.estado,
        fecha: Sequelize.fn("NOW"),
        latitud: req.body.latitud,
        longitud: req.body.longitud,
        id_persona: usuarioId.id,
        external_id: UUID.v4(),
      });
      if (result === null) {
        res.status(401);
        res.json({
          msg: "ERROR",
          tag: "NO se pudo crear",
          code: 401,
        });
      } else {
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
  }
  //}
}
module.exports = ComentarioControl;
