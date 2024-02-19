var express = require('express');
var router = express.Router();
let jwt = require("jsonwebtoken");

const persona= require('../app/controllers/PersonaControl')
const rol= require('../app/controllers/RolControl')
const noticia=require('../app/controllers/NoticiaControl')
const cuentaControl=require('../app/controllers/CuentaControl');
const comentarioControl=require('../app/controllers/ComentarioControl');



let personaControl= new persona();
let rolControl=new rol();
let noticiaControl= new noticia();
let acceso=new cuentaControl();
let comentario=new comentarioControl();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Middlewar
const auth = function middleware(req, res, next) {
  const token = req.headers["token-key"];

  console.log(req.headers);

  if (token === undefined) {
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Falta token",
      code: 401,
    });
  } else {
    require("dotenv").config();
    const key = process.env.KEY;
    jwt.verify(token, key, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "ERROR",
          tag: "Token no valido o expirado",
          code: 401,
        });
      } else {
        
        console.log(decoded)
        req.id = decoded.external;
        console.log("aquio");
        console.log(req.id);
        const models = require("../app/models");
        const cuenta = models.cuenta;
        const aux = await cuenta.findOne({
          where: { external_id: decoded.external },
        });
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "ERROR",
            tag: "Token no valido",
            code: 401,
          });
        } else {
          next();
        }
      }
    });
  }
  // console.log(req.url);
  // console.log(token);
  // next();
};

const isAdmin = async (req, res, next) => {
  const models = require("../app/models");
  
  const cuenta = models.cuenta;
  console.log(cuenta)
  console.log(req.id)
  
    
  const aux = await cuenta.findOne({
    where: { external_id: req.id },
  });
  const persona = models.persona;
  const personAux = await persona.findOne({
    where: { id: aux.id_persona },
  });
  const rol = models.rol;
  const rolAux = await rol.findOne({
    where: { id: personAux.id_rol },
  });

  if (rolAux.nombre === "Administrador") {
    console.log("es admin")
    next();
    return
  } else {
    console.log("no es admin")
    
    res.status(401);
    res.json({
      msg: "ERROR",
      tag: "Debe ser un Gerente",
      code: 401,
    });
    return
  }

  // console.log(req.url);
  // console.log(token);
  // next();
};


// PERSONAAAAA
router.get('/admin/persona', personaControl.listar);
router.post('/admin/persona/save', personaControl.crear);
router.post('/admin/usuarioC/save',personaControl.validarUsuario, personaControl.usuario);
router.get('/admin/validarRol',[auth, isAdmin], acceso.validarGerente);
router.get('/admin/usuario/:external', personaControl.obtenerUsuario);

router.put('/admin/persona/baneo/:external', personaControl.banear);

router.put('/admin/persona/update/:external', personaControl.update);


// ROLLL
router.get('/admin/rol', rolControl.listar);
router.post('/admin/rol/save', rolControl.crear);

// NOTICIAAAAA
router.get('/admin/noticias', noticiaControl.listar);
router.get('/admin/noticia/:external', noticiaControl.obtener);
router.post('/admin/noticias/save', noticiaControl.crear);
router.post('/admin/noticias/files/save/:external', noticiaControl.guardarFoto);

//CUENTAAAAAAAAA
router.post('/admin/inicio_sesion', acceso.inicio_sesion);

//COMENTARIOOO
router.get('/admin/comentarios', comentario.listar);
router.get('/admin/comentario/:external', comentario.obtener_noticia);
router.put('/admin/comentario/update/:external', comentario.modificar);

router.get('/admin/comentarioUsuario/:external', comentario.obtener_usuario);
router.post('/admin/comentarios/save', comentario.crear);


module.exports = router;
