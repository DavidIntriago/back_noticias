"use strict";

module.exports = (sequelize, DataTypes) => {
  const noticias = sequelize.define('noticias', {
    titulo:{type: DataTypes.STRING(100), defaultValue: "NONE"},
    tipo_noticia:{type: DataTypes.ENUM('Normal', 'Depertiva', 'Urgente', 'Social', 'Tecnologica')},
    cuerpo:{type: DataTypes.STRING, defaultValue: "NONE"},
    fecha:{type: DataTypes.DATEONLY},
    foto:{type: DataTypes.STRING, defaultValue: "undefined.jpeg"},
    estado:{type: DataTypes.BOOLEAN, defaultValue:true},
    external_id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
  }, {
    timestamps: false,
    freezeTableName:true
  });
  noticias.associate = function (models) {
    noticias.belongsTo(models.persona, {foreignKey:'id_persona'})
    noticias.hasMany(models.comentario, { foreignKey: 'id_noticia', as: 'comentario' });

  };
  return noticias;
};

