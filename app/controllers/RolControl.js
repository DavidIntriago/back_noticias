"use strict";

var models = require("../models");
var rol = models.rol;

class RolControl {
  async listar(req, res) {
    var lista = await rol.findAll({
      // para limitar lo que va a listar, envia loss atributos y con esto[cambia de nombre]
      attributes: ["nombre", "external_id"],
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
    // Lista de campos permitidos
    
      var result = await rol.create({
        nombre: req.body.nombre,
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
    
  }
}
module.exports = RolControl;
