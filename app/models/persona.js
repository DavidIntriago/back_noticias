"use strict";

module.exports = (sequelize, DataTypes) => {
  const persona = sequelize.define('persona', {
    nombres:{type: DataTypes.STRING(100), defaultValue: "NONE"},
    apellidos:{type: DataTypes.STRING(100), defaultValue: "NONE"},
    direccion:{type: DataTypes.STRING, defaultValue: "NONE"},
    celular:{type: DataTypes.STRING(20), defaultValue: "NONE"},
    fecha_nac:{type: DataTypes.DATEONLY},
    external_id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
  }, {
    timestamps: false,
    freezeTableName:true
  });
  persona.associate = function (models) {
    persona.hasOne(models.cuenta, { foreignKey: 'id_persona', as: 'cuenta' });
    persona.belongsTo(models.rol, {foreignKey:'id_rol'})
    persona.hasMany(models.noticias, { foreignKey: 'id_persona', as: 'noticias' });
    persona.hasMany(models.comentario, { foreignKey: 'id_persona', as: 'comentario' });

  };
  return persona;
};
