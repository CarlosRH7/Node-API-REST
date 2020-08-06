const express = require('express')
const app = express()
const Usuario = require('../models/usuario');
// Importamos el paquete bcrypt para encriptar el password
const bcrypt = require('bcrypt');
// Importamos el paquete underscore para la parte de PUT que permita excluir campos del objeto
const _ = require('underscore');

app.get('/usuario', function (req, res) {
    // Paginación
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({estado: true}, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            Usuario.countDocuments({estado: true}, (err, conteo)=>{
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })
            })

            
        })
})
 
app.post('/usuario', function (req, res) {
    let body = req.body;

    let usuario =  new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarrioDB)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarrioDB
        })
    });
    
})

app.put('/usuario/:id', function (req, res) {
    let id = req.params.id
    // let body = req.body;
    // indico que campos pueden ser actualizados 
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // {new:true, runValidators: true} indico que me regrese el registro actualizado y me realice las validaciones
    Usuario.findByIdAndUpdate(id, body, {new:true, runValidators: true}, (err, usuarrioDB)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        
        res.json({
            ok: true,
            usuario: usuarrioDB
        });
    });
    
})

app.delete('/usuario/:id', function (req, res) {
   
    let id =  req.params.id;

    // Se elimina el resgitro de manera permanente
    // Usuario.findByIdAndRemove(id, (err, usurioBorrado)=>{
    // });

    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, (err, usurioBorrado)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if(!usurioBorrado){
            return res.status(400).json({
                ok:false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usurioBorrado
        });
    });


    
})

module.exports = app;
