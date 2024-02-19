"use strict";

var formidable = require("formidable");
var models = require("../models");
var fs = require("fs");
var persona = models.persona;
var noticia = models.noticias;
var extensiones = ["jpg", "png", "jpeg"];
const tamanioMax = 2 * 1024 * 1024;


class NoticiaControl {
  async listar(req, res) {
    var lista = await noticia.findAll({
      where: {estado: true},
      include: [
        {
          model: models.persona,
          as: "persona",
          attributes: ["apellidos", "nombres"],
        },
      ],
      // para limitar lo que va a listar, envia loss atributos y con esto[cambia de nombre]
      attributes: ["titulo", "external_id", "cuerpo", "fecha", "foto"],
    });
    res.status(200);
    res.json({
      msg: "OK",
      code: 200,
      data: lista,
    });
  }

  async obtener(req, res) {
    const external = req.params.external;
    var lista = await noticia.findOne({
      where: { external_id: external },
      include: [
        {
          model: models.persona,
          as: "persona",
          attributes: ["apellidos", "nombres"],
        },
      ],
      // para limitar lo que va a listar, envia loss atributos y con esto[cambia de nombre]
      attributes: ["titulo", ["external_id", "id"], "cuerpo", "fecha", "foto"],
    });
    if (lista === undefined || lista === null) {
      res.status(200);
      res.json({
        msg: "OK",
        code: 200,
        data: {},
      });
    } else {
      res.status(200);
      res.json({
        msg: "OK",
        code: 200,
        data: lista,
      });
    }
  }

  async crear(req, res) {
    var UUID = require("uuid");
    var personaId = await persona.findOne({
      where: { external_id: req.body.id_persona },
    });

    // Lista de campos permitidos
    const camposPermitidos = [
      "titulo",
      "tipo_noticia",
      "cuerpo",
      "fecha",
      "id_persona",
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
      if (personaId !== undefined && personaId !== null) {
        var result = await noticia.create({
          titulo: req.body.titulo,
          tipo_noticia: req.body.tipo_noticia,
          cuerpo: req.body.cuerpo,
          fecha: req.body.fecha,
          foto: req.body.foto,
          id_persona: personaId.id,
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
  }

  async guardarFoto(req, res) {
    const externalnoticia = req.params.external;
    var form = new formidable.IncomingForm(),
      files = [];

    form
      .on("file", function (field, file) {
        files.push(file);
      })
      .on("end", function () {
        console.log("OK");
      });

    form.parse(req, async function (err, fields) {
      let listado = files;
      let external = fields.external[0];
      let fotos = [];

      for (let index = 0; index < listado.length; index++) {
        var file = listado[index];
        var extension = file.originalFilename.split(".").pop().toLowerCase();

        if (file.size > tamanioMax) {
          res.status(400);
          return res.json({
            msg: "ERROR",
            tag: "El tamaño del archivo supera los 2MB ",
            code: 400,
          });
        }

        if (!extensiones.includes(extension)) {
          res.status(400);
          return res.json({
            msg: "ERROR",
            tag: "Solo soporta " + extensiones,
            code: 400,
          });
        }

        const name = external + "_" + index + "." + extension;
        fotos.push(name);
        fs.rename(file.filepath, "public/images/" + name, async function (err) {
          if (err) {
            res.status(400);
            console.log(err);
            return res.json({
              msg: "Error",
              tag: "No se pudo guardar el archivo",
              code: 400,
            });
          }
        });
      }

      const variasFoto = fotos.join(",");
      await noticia.update(
        { foto: variasFoto },
        { where: { external_id: externalnoticia } }
      );

      res.status(200);
      res.json({ msg: "OK", tag: "Imágenes guardadas", code: 200 });
    });
  }
}
module.exports = NoticiaControl;
