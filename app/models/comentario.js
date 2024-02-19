"use strict";

module.exports = (sequelize, DataTypes) => {
  const comentario = sequelize.define('comentario', {
    cuerpo:{type: DataTypes.STRING},
    estado:{type: DataTypes.BOOLEAN, defaultValue:true},
    fecha:{type: DataTypes.DATEONLY},
    longitud:{type: DataTypes.FLOAT},
    latitud:{type: DataTypes.FLOAT},
    external_id:{type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}

    
    
  }, {
    freezeTableName:true
  });
  comentario.associate = function (models) {
    comentario.belongsTo(models.noticias, {foreignKey:'id_noticia'})
    comentario.belongsTo(models.persona, {foreignKey:'id_persona'})


  };
  return comentario;
};
