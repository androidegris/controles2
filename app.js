/**
 * app.js:
 * ----------
 *    Servidor express de prueba para controles hls
 *  
 * Andres J. Guzman M. 
 * Universidad Simon Bolivar, 2017.
 */


//Heroku

var port = process.env.PORT || 5000;
var file = "historico.db";


// Lista clientes
  var clientesD = [
       {cliente: 'ACIMP'},
{cliente: 'AGROSUR'},
{cliente: 'ALUMINIOS FIMA'},
{cliente: 'ALUVIDRIOS SAN ANTON'},
{cliente: 'ALUVIGLASS'},
{cliente: 'ARARAT'},
{cliente: 'ASOCIACION ISRAELITA'},
{cliente: 'BLU'},
{cliente: 'CAIV'},
{cliente: 'CENTURY'},
{cliente: 'CIERRE MES'},
{cliente: 'COLEGIO EL AVILA'},
{cliente: 'COLEGIO HEBRAICA'},
{cliente: 'COLOMURAL'},
{cliente: 'COLORSCAN'},
{cliente: 'CRISTO REY'},
{cliente: 'DIALAN'},
{cliente: 'DIPRHOS'},
{cliente: 'DISUCA'},
{cliente: 'EUROMERCADO'},
{cliente: 'EXIAUTO'},
{cliente: 'EXTRUDAL'},
{cliente: 'FACTORY'},
{cliente: 'FERIADO'},
{cliente: 'FRAGANCE'},
{cliente: 'HLS'},
{cliente: 'HLSI'},
{cliente: 'INACOR'},
{cliente: 'JEANS CENTER'},
{cliente: 'JENARO AGUIRRE'},
{cliente: 'KTK'},
{cliente: 'LATT'},
{cliente: 'LTC PERFUMES'},
{cliente: 'MADRE MARIA LUISA'},
{cliente: 'MIMI'},
{cliente: 'MULTILENTE'},
{cliente: 'NUEVO MUNDO'},
{cliente: 'NUTRITEK'},
{cliente: 'OP AS'},
{cliente: 'OSCAR DE LA R'},
{cliente: 'PARAISO'},
{cliente: 'PEDRO LEGARIA'},
{cliente: 'PERSONAL'},
{cliente: 'PROTUL'},
{cliente: 'REYMAQ'},
{cliente: 'RODRIMER'},
{cliente: 'SOLINTEX'},
{cliente: 'TACHIRA'},
{cliente: 'TECHWARE'},
{cliente: 'TECNO'},
{cliente: 'TRILOBITE'},
{cliente: 'U.I.C.'},
{cliente: 'UNICENTRO'},
{cliente: 'VACACIONES'},
{cliente: 'VARIOS'},
{cliente: 'VIPASORIN'},
{cliente: 'VIVERES CARACAS'}
      ];

var express=require('express');
var app=express();
var request = require('request');
var bodyParser = require('body-parser');
var session = require('express-session'); // sesion
var hbs = require('hbs'); // Render vistas
var async = require("async"); // Libreria para manejar sincronia



// Inicializamos sesion
app.use(session({
    secret: 'hls_sesion',
    name: 'hls_cookie',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
var sess;

// Direccionamos recursos publicos
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));



// Operador para comparar en vistas
hbs.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});







// Parser peticiones post
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/*
 * PAGINA PRINCIPAL
 * ---------------
 */ 
app.get('/', function(req, res){
  sess = req.session;
  if (sess.asesor){
      res.render('index', { title: 'Controles HLS',
                            clientes: clientesD,
                            asesor: sess.asesor
          
      });
  }
  else {
    res.render('index', { title: 'Controles HLS', clientes: clientesD});  
  }
});


/*
 * AGENDA
 * ---------------
 */ 
app.get('/agenda', function(req, res){
  sess = req.session;
  if (sess.asesor){
      res.render('agenda', { title: 'Controles HLS',
                            asesor: sess.asesor
      });
  }
  else {
    res.render('agenda', { title: 'Controles HLS'});  
  }
});


// Funcion auxiliar remover elemento de arreglo
function remove(array, element) {
    const index = array.indexOf(element);
    
    if (index !== -1) {
        array.splice(index, 1);
    }
}

// Funcion auxiliar agregar elemento a arreglo
function agregar(array, element) {
    const index = array.indexOf(element);
    
    if (index == -1) {
        array.push(element);
    }
}


/*
 * HISTORICO VISTA CALENDARIO LISTA REPORTES
 * --------------->
 */
app.get('/historicoCalendario', function(req, respuesta){
    sess = req.session;
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    var reportesD = [];
    var asesores = [];
    var fechaPrimera = "";
    var primeraFecha = false;
    var select = "SELECT * FROM Reportes ORDER BY anio, mes, dia";
    try {
        db.each(select,
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                var datosFecha = [row.dia , row.mes, row.anio];
                var fechaIn = datosFecha.join("/");
                if (!primeraFecha) {
                    fechaPrimera = fechaIn;
                    primeraFecha = true;
                }
                // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var cantidad = row.hora_inicio.toString().split(".");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
                // hora fin
                var cantidad2 = row.hora_fin.toString().split(".")
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
                // hora fact
                var cantidad3 = row.h_fact.toString().split(".")
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                if (row.descripcion == undefined) {
                    var desc = "";
                }
                else {
                    var desc = row.descripcion;
                }
                var asesor = row.asesor;
                agregar(asesores,asesor);
                reportesD.push({ 
                                asesor: row.asesor, 
                                cliente: row.cliente,
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                obs: desc
                            });
                            
                }
                    },function(err, num){
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }        
                        
                        if (reportesD.length == 0) {
                            reportesD.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });   
            
                        }
                        var colores = ["#337CBB","#90B517","#000000","#A6113C","#7F0037","#6D7F3F","#0094FF","#6C7C76"];
                        var asesoresC = [];
                        var i=0;
                        for (i = 0; i < asesores.length; i++) {
                            
                        if (asesores[i]=="andres") {
             asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#337CBB"
                            });
        }
        else if (asesores[i]=="Javier"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#90B517"
                            });
            
        }
        else if (asesores[i]=="cmunoz"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#6C7C76"
                            });
            
        }
        else if (asesores[i]=="mhuerta"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#6D7F3F"
                            });
            
        }
        else if (asesores[i]=="Guayarmina"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#A6113C"
                            });
            
        }
         else if (asesores[i]=="gutierol"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#000000"
                            });
            
        }
        else {
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: colores.pop()
                            });
        }
                        }
    
    
                        if (sess.asesor){
                        respuesta.render('reportescalendariohist', { title: 'Lista Reportes Histórico',
                                    eventos: reportesD,
                                    asesor: sess.asesor,
                                    asesores: asesoresC,
                                    fechaPrimera: fechaPrimera
          
                        });
                        }
                        else {
                        respuesta.render('reportescalendariohist', { title: 'Lista Reportes Histórico',
                                        asesores: asesoresC,
                                        eventos: reportesD, clientes: clientesD,
                                        fechaPrimera: fechaPrimera});  
                        }
                    });
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});



/*
 * VISTA CALENDARIO LISTA REPORTES
 * ---------------
 */ 
app.get('/reportesCalendario', function(req, res){
  sess = req.session;
  
  
  // Solicitud a servidor para ver controles
    request('http://controleshls.azurewebsites.net/subirReportes?', function (error, response, body) {
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var reportesD = [];
    var asesores = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidadR = parseInt(cantidadRes[1], 10); 
            var contador = 1;
            while (contador <= cantidadR) {
                var transf = respuestas[contador].split("|");
                var datosFecha = [transf[3] ,transf[4],transf[5]];
                var fechaIn = datosFecha.join("/");
                // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var cantidad = transf[6].split(".");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
                // hora fin
                var cantidad2 = transf[7].split(".");
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
                // hora fact
                var cantidad3 = transf[9].split(".");
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var asesor = transf[1];
                agregar(asesores,asesor);
                reportesD.push({ 
                                asesor: transf[1], 
                                cliente: transf[2],
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                descripcion: transf[8]
                            });
                contador = contador + 1;
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (reportesD.length == 0) {
        reportesD.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });   
            
        }
    
    var colores = ["#7F0037","#0094FF","#FFB27F","#7F006E"];
    var asesoresC = [];
    var i=0;
    for (i = 0; i < asesores.length; i++) {
        if (asesores[i]=="andres") {
             asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#337CBB"
                            });
        }
        else if (asesores[i]=="Javier"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#90B517"
                            });
            
        }
        else if (asesores[i]=="cmunoz"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#6C7C76"
                            });
            
        }
        else if (asesores[i]=="mhuerta"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#6D7F3F"
                            });
            
        }
        else if (asesores[i]=="Guayarmina"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#A6113C"
                            });
            
        }
         else if (asesores[i]=="gutierol"){
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: "#000000"
                            });
            
        }
        else {
            asesoresC.push({ 
                                asesor: asesores[i], 
                                color: colores.pop()
                            });
        }
    }
    
    
  if (sess.asesor){
      res.render('reportescalendario', { title: 'Lista Reportes',
                            eventos: reportesD,
                            asesor: sess.asesor,
                            asesores: asesoresC
          
      });
  }
  else {
    res.render('reportescalendario', { title: 'Lista Reportes',
                            asesores: asesoresC,
                            eventos: reportesD, clientes: clientesD});  
  }
    } 
else {
        res.render('error', { titulo: 'Vista Calendario', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});


/*
 * VISTA CALENDARIO REPORTES ASESOR (revisar)
 * ---------------
 */ 
app.post('/calendarioSubirActividadesAsesor', urlencodedParser, function(req, res) {
    sess = req.session;
    var nombre = req.body.asesor;
    var enSesion = req.body.enSesion;
    var edicion = false;
    if ((nombre == "enSesion" || enSesion == "enSesion") && sess.asesor) {
        nombre = sess.asesor;
        edicion = true;
    }
    var nombreD = "user=" + nombre;
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/resumenReportesAsesor',
        body:    nombreD
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    var asesores = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        var listaReportes = [];
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidad = parseInt(cantidadRes[1], 10); 
            var contador = 0;
            var linea = 1;
            while (contador < cantidad) {
                var transf = respuestas[linea].split("|");
                if (transf[0] == "") { // Linea Reporte
                    linea = linea + 1;
                    var cliente = transf[2];
                    var descripcion = transf[4];
                    var datosFecha = [transf[5] ,transf[6],transf[7]];
                    var fechaIn = datosFecha.join("/");
                    // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var entero = transf[8].split(".");
                var hor_ini = parseInt(entero[0],10);
                var min_ini = 0;
                if (entero.length > 1) {
                    if (entero[1].length > 1) {
                        min_ini = parseInt(entero[1],10);
                    }
                    else {
                        min_ini = parseInt(entero[1],10) * 10;
                    }
                }
                // hora fin
                var entero2 = transf[9].split(".");
                var hor_fin = parseInt(entero2[0],10);
                var min_fin = 0;
                if (entero2.length > 1) {
                    if (entero2[1].length > 1) {
                        min_fin = parseInt(entero2[1],10);
                    }
                    else {
                        min_fin = parseInt(entero2[1],10) * 10;
                    }
                }
                // hora fact
                var entero3 = transf[10].split(".");
                var hor_fact = parseInt(entero3[0],10);
                var min_fact = 0;
                if (entero3.length > 1) {
                    if (entero3[1].length > 1) {
                        min_fact = parseInt(entero3[1],10);
                    }
                    else {
                        min_fact = parseInt(entero3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var actividades = [];
                var hayActividades = false;
                // Vemos lineas de actividades si tiene    
                var linActividad = respuestas[linea].split("|");
                while (linActividad[0] != "") { // Linea Actividad 
                    hayActividades = true;
                    actividades.push({
                        desc: linActividad[0]
                    });
                    linea = linea + 1;
                    linActividad = respuestas[linea].split("|");
                }
                if (hayActividades) {
                    listaReportes.push({
                        asesor: nombre, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        descripcion: descripcion,
                        actividades: actividades
                    });
                }
                else {
                    listaReportes.push({
                        asesor: nombre, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        descripcion: descripcion
                    });
                }
                contador = contador + 1;
            }
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (listaReportes.length == 0) {
        listaReportes.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });     
            
        }
        var tituloD = "Calendario Reportes de " + nombre;
        res.render('asesorcalendario', { title: tituloD,
                            eventos: listaReportes, clientes: clientesD});  
    }
    else {
        res.render('error', { titulo: 'Calendario Lista Reportes', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});


/*
 * VISTA CALENDARIO REPORTES ASESOR EDITAR
 * ---------------
 */ 
app.post('/calendarioEditarActividadesAsesor', urlencodedParser, function(req, res) {
    sess = req.session;
    if (sess.asesor) {
        var nombre = sess.asesor;
    }
  else {
      res.render('error', { titulo: 'Calendario Reportes', 
            error: 'Asesor no logueado' });
    }
    var nombreD = "user=" + nombre;
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/resumenReportesAsesor',
        body:    nombreD
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    var asesores = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        var listaReportes = [];
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidad = parseInt(cantidadRes[1], 10); 
            var contador = 0;
            var linea = 1;
            while (contador < cantidad) {
                var transf = respuestas[linea].split("|");
                if (transf[0] == "") { // Linea Reporte
                    linea = linea + 1;
                    var cliente = transf[2];
                    var descripcion = transf[4];
                    var datosFecha = [transf[5] ,transf[6],transf[7]];
                    var fechaIn = datosFecha.join("/");
                    // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var entero = transf[8].split(".");
                var hor_ini = parseInt(entero[0],10);
                var min_ini = 0;
                if (entero.length > 1) {
                    if (entero[1].length > 1) {
                        min_ini = parseInt(entero[1],10);
                    }
                    else {
                        min_ini = parseInt(entero[1],10) * 10;
                    }
                }
                // hora fin
                var entero2 = transf[9].split(".");
                var hor_fin = parseInt(entero2[0],10);
                var min_fin = 0;
                if (entero2.length > 1) {
                    if (entero2[1].length > 1) {
                        min_fin = parseInt(entero2[1],10);
                    }
                    else {
                        min_fin = parseInt(entero2[1],10) * 10;
                    }
                }
                // hora fact
                var entero3 = transf[10].split(".");
                var hor_fact = parseInt(entero3[0],10);
                var min_fact = 0;
                if (entero3.length > 1) {
                    if (entero3[1].length > 1) {
                        min_fact = parseInt(entero3[1],10);
                    }
                    else {
                        min_fact = parseInt(entero3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var actividades = [];
                var hayActividades = false;
                // Vemos lineas de actividades si tiene    
                var linActividad = respuestas[linea].split("|");
                while (linActividad[0] != "") { // Linea Actividad 
                    hayActividades = true;
                    actividades.push({
                        desc: linActividad[0]
                    });
                    linea = linea + 1;
                    linActividad = respuestas[linea].split("|");
                }
                if (hayActividades) {
                    listaReportes.push({
                        asesor: nombre, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        descripcion: descripcion,
                        actividades: actividades
                    });
                }
                else {
                    listaReportes.push({
                        asesor: nombre, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        descripcion: descripcion
                    });
                }
                contador = contador + 1;
            }
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (listaReportes.length == 0) {
        listaReportes.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });     
            
        }
        var tituloD = "Calendario Reportes de " + nombre;
        res.render('asesorcalendarioedit', { title: tituloD,
                            eventos: listaReportes, clientes: clientesD});  
    }
    else {
        res.render('error', { titulo: 'Calendario Lista Reportes', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});



/*
 * HISTORICO VISTA CALENDARIO REPORTES ASESOR
 * ---------------
 */ 
app.post('/historicoCalendarioAsesor', urlencodedParser, function(req, respuesta) {
    sess = req.session;
   var asesor = req.body.asesor;
    var reportesD = [];
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    var lista = [];
    var listaReportes = [];
     var fechaPrimera = "";
    var primeraFecha = false;
    // Si la solicitud fue exitosa parseamos el resultado
    try {
        var select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.asesor = '" + asesor  +"' "
                     " ORDER BY Clientes._id,anio,mes,dia";
        var contadorReportes = 0;
        db.each(select, 
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                        var reporte = [row._id, row.nombre, row.asesor,
                                             row.descripcion,
                                             row.dia, row.mes, row.anio, 
                                             row.hora_inicio, row.hora_fin, row.h_fact];
                        lista.push(reporte);
                        contadorReportes = contadorReportes + 1;
                        }
                    },
                    function(err, num){ // Termine Todos los reportes
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }
                    var texto = ""; 
                    async.eachSeries(lista,
                        // Funcion donde cada elemento de lista es pasado
                     function(r, callback){
                         var lista_act = "";
                        // Vemos si actividad existe
                        db.each("SELECT descripcion  FROM Actividades WHERE asesor = ? " +
                        "AND cliente = ? AND dia = ? AND mes = ? AND anio = ? ",
                        [   r[2],r[1],r[4],
                            r[5],r[6]
                        ], 
                        function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                        lista_act = lista_act + "--" + row.descripcion + "\n";
                        }
                        },
                    function(err, num){ // Termine Todos las actividades
                        if (err){
                            console.log(err);
                            console.log("Error obteniendo actividades"+"\n");
                            callback();
                            throw err;
                        }
                        else {
                            var asesor = r[2];
                            var cliente = r[1];
                            var descripcion =r[3];
                            var datosFecha = [r[4] ,r[5],r[6]];
                            var fechaIn = datosFecha.join("/");
                            if (!primeraFecha) {
                                fechaPrimera = fechaIn;
                                primeraFecha = true;
                            }
                    // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var entero = r[7].toString().split(".");
                var hor_ini = parseInt(entero[0],10);
                var min_ini = 0;
                if (entero.length > 1) {
                    if (entero[1].length > 1) {
                        min_ini = parseInt(entero[1],10);
                    }
                    else {
                        min_ini = parseInt(entero[1],10) * 10;
                    }
                }
                // hora fin
                var entero2 = r[8].toString().split(".");
                var hor_fin = parseInt(entero2[0],10);
                var min_fin = 0;
                if (entero2.length > 1) {
                    if (entero2[1].length > 1) {
                        min_fin = parseInt(entero2[1],10);
                    }
                    else {
                        min_fin = parseInt(entero2[1],10) * 10;
                    }
                }
                // hora fact
                var entero3 = r[9].toString().split(".");
                var hor_fact = parseInt(entero3[0],10);
                var min_fact = 0;
                if (entero3.length > 1) {
                    if (entero3[1].length > 1) {
                        min_fact = parseInt(entero3[1],10);
                    }
                    else {
                        min_fact = parseInt(entero3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var actividades = [];
                var hayActividades = false;
                // Vemos lineas de actividades si tiene    
                var linActividad = lista_act.split("\n");
                var tam = linActividad.length;
                var j = 0;
                while (j != tam) { // Linea Actividad 
                    hayActividades = true;
                    actividades.push({
                        desc: linActividad[j]
                    });
                    j = j +1;
                }
                if (hayActividades) {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion,
                        actividades: actividades
                    });
                }
                else {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion
                    });
                }
                callback(); // Termino ver 1 reporte
                
                            
                        }
                        
                        
                        
                        }
                        ); 
                    },
                    // Cuando terminaron todos los eliminar actividades
                    function(err){
                        if (err){
                            console.log(err);
                            respuesta.end("Error: Problemas en actividades"+ "\n");
                            db.close();
                        }
                        else{
        
        
        if (listaReportes.length == 0) {
        listaReportes.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });     
            
        }
        var tituloD = "Calendario Histórico Reportes de " + asesor;
            
        respuesta.render('asesorcalendariohistorico', { title: tituloD,
                            eventos: listaReportes, clientes: clientesD,
                            fechaPrimera: fechaPrimera});
        db.close();  
                            
                        }
                    }); // Termino async actividades  
                    });
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});
                     
       
    





/*
 * ADMIN
 * ---------------
 */ 
app.get('/admin', function(req, res){
  sess = req.session;
  if (sess.asesor){
      res.render('admin', { title: 'Controles HLS',
                            clientes: clientesD,
                            asesor: sess.asesor
          
      });
  }
  else {
    res.render('admin', { title: 'Controles HLS', clientes: clientesD});  
  }
});

/*
 * LOGIN
 * ---------------
 */ 
app.post('/loginAdmin', urlencodedParser, function(req, res){
    sess = req.session;
    var user = req.body.user;
    var clave = req.body.clave;
    
    
    if (user=="adminhls" && clave=="ag1603") {
        res.redirect("http://controleshls.azurewebsites.net");
    }
        else {
            console.log("ERROR: Credenciales incorrectas");
            res.render("error", { titulo: 'Login Admin', 
                error: "ERROR: Credenciales incorrectas" });
        }
});


/*
 * PAGINA HISTORICO
 * ---------------
 */ 
app.get('/historico', function(req, res){
  sess = req.session;
  if (sess.asesor){
      res.render('historico', { title: 'Controles HLS',
                            clientes: clientesD,
                            asesor: sess.asesor
          
      });
  }
  else {
    res.render('historico', { title: 'Controles HLS', clientes: clientesD});  
  }
});


/*
 * HISTORICO LISTA REPORTES
 * --------------->
 */
app.get('/historicoSubirReportes', function(req, respuesta){
    sess = req.session;
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    var reportesD = [];
    var hayMes = true;
    var mes = parseInt(req.query.mes, 10);
    if (mes == undefined || isNaN(mes) || mes < 1 || mes > 12) { // Vemos mes
        hayMes = false;
    }
    var select = "SELECT * FROM Reportes ORDER BY anio, mes, dia";
    if (hayMes) {
        select = "SELECT * FROM Reportes WHERE mes=" + mes +
                 " ORDER BY anio, mes, dia";
    }
    try {
        db.each(select,
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                var datosFecha = [row.dia , row.mes, row.anio];
                var fechaIn = datosFecha.join("/");
                // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var cantidad = row.hora_inicio.toString().split(".");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
                // hora fin
                var cantidad2 = row.hora_fin.toString().split(".")
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
                // hora fact
                var cantidad3 = row.h_fact.toString().split(".")
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                if (row.descripcion == undefined) {
                    var desc = "";
                }
                else {
                    var desc = row.descripcion;
                }
                reportesD.push({ 
                                asesor: row.asesor, 
                                cliente: row.cliente,
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                obs: desc
                            });
                            
                }
                    },function(err, num){
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }        
                        
                        if (reportesD.length == 0) {
                            reportesD.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });   
            
                        }
                        var datos={
                                    titulo:'Lista Reportes Histórico', 
                                    reportes: reportesD
                        };
                        respuesta.render('reporteshist', datos);
                    });
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});

/*
 * HISTORICO LISTA REPORTES
 * --------------->
 */
app.post('/historicoSubirReportesMes', urlencodedParser, function(req, respuesta){
    sess = req.session;
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    var reportesD = [];
    var hayMes = true;
    var hayAnio = true;
    var mes = parseInt(req.body.mes, 10);
    var anio = parseInt(req.body.anio, 10);
    if (mes == undefined || isNaN(mes) || mes < 1 || mes > 12) { // Vemos mes
        hayMes = false;
    }
    if (anio == undefined || isNaN(anio) || anio < 2015 || anio > 2020) { // Vemos anio
        hayAnio = false;
    }
    var select = "SELECT * FROM Reportes ORDER BY anio, mes, dia";
    if (hayMes && !hayAnio) {
        select = "SELECT * FROM Reportes WHERE mes=" + mes +
                 " ORDER BY anio, mes, dia";
    }
    else if (hayMes && hayAnio) {
        select = "SELECT * FROM Reportes WHERE mes=" + mes +
                 " AND anio=" + anio +
                 " ORDER BY anio, mes, dia";
    }
    else if (!hayMes && hayAnio){
        select = "SELECT * FROM Reportes WHERE anio=" + anio +
                 " ORDER BY anio, mes, dia";
    }
    
    try {
        db.each(select,
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                var datosFecha = [row.dia , row.mes, row.anio];
                var fechaIn = datosFecha.join("/");
                // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var cantidad = row.hora_inicio.toString().split(".");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
                // hora fin
                var cantidad2 = row.hora_fin.toString().split(".")
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
                // hora fact
                var cantidad3 = row.h_fact.toString().split(".")
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                if (row.descripcion == undefined) {
                    var desc = "";
                }
                else {
                    var desc = row.descripcion;
                }
                reportesD.push({ 
                                asesor: row.asesor, 
                                cliente: row.cliente,
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                obs: desc
                            });
                            
                }
                    },function(err, num){
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }        
                        
                        if (reportesD.length == 0) {
                            reportesD.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });   
            
                        }
                        
                        var datos={
                                    titulo:'Lista Reportes Histórico', 
                                    reportes: reportesD
                            };
                            
                            
                        
                        if (hayAnio) {
                            var tituloAnio = 'Lista Reportes Histórico del ' + anio;
                                datos={
                                    titulo:tituloAnio, 
                                    mes: mes,
                                    reportes: reportesD
                            };
                        }
                        
                        
                        if (hayMes) {
                            var tituloMes = 'Lista Reportes Histórico de '
                            if (mes == 1) {
                                tituloMes = tituloMes + "Enero";
                            }
                            if (mes == 2) {
                                tituloMes = tituloMes + "Febrero";
                            }
                            if (mes == 3) {
                                tituloMes = tituloMes + "Marzo";
                            }
                            if (mes == 4) {
                                tituloMes = tituloMes + "Abril";
                            }
                            if (mes == 5) {
                                tituloMes = tituloMes + "Mayo";
                            }
                            if (mes == 6) {
                                tituloMes = tituloMes + "Junio";
                            }
                            if (mes == 7) {
                                tituloMes = tituloMes + "Julio";
                            }
                            if (mes == 8) {
                                tituloMes = tituloMes + "Agosto";
                            }
                            if (mes == 9) {
                                tituloMes = tituloMes + "Septiembre";
                            }
                            if (mes == 10) {
                                tituloMes = tituloMes + "Octubre";
                            }
                            if (mes == 11) {
                                tituloMes = tituloMes + "Noviembre";
                            }
                            if (mes == 12) {
                                tituloMes = tituloMes + "Diciembre";
                            }
                            if (hayAnio) {
                                tituloMes = tituloMes + " del " + anio;
                            }
                        
                            datos={
                                    titulo:tituloMes, 
                                    mes: mes,
                                    reportes: reportesD
                            };
                        }
                        respuesta.render('reporteshist', datos);
                    });
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});


/*
 * Base de datos historico
 * ---------------
 */ 
app.get('/historicoBaseDatos.db', function(req, res){
    res.sendFile('historico.db', { root: __dirname });
});


/*
 * HISTORICO REPORTES POR ASESOR
 * --------------------------
 */
app.post('/historicoSubirReportesAsesor', urlencodedParser, function(req, respuesta) {
    sess = req.session;
    var nombre = req.body.asesor;
    var enSesion = req.body.enSesion;
    var edicion = false;
    if ((nombre == "enSesion" || enSesion == "enSesion") && sess.asesor) {
        nombre = sess.asesor;
        edicion = true;
    }
    var nombreD = "asesor=" + nombre;
    var reportesD = [];
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    var hayMes = true;
    var hayAnio = true;
    var mes = parseInt(req.body.mes, 10);
    var anio = parseInt(req.body.anio, 10);
    if (mes == undefined || isNaN(mes) || mes < 1 || mes > 12) { // Vemos mes
        hayMes = false;
    }
    if (anio == undefined || isNaN(anio) || anio < 2015 || anio > 2020) { // Vemos anio
        hayAnio = false;
    }
    var select = "SELECT * FROM Reportes WHERE asesor='"+ nombre + "' ORDER BY anio, mes, dia";
    if (hayMes && !hayAnio) {
        select =  "SELECT * FROM Reportes WHERE asesor='"+ nombre + "' AND mes=" + mes +
                 " ORDER BY anio, mes, dia";
    }
    else if (hayMes && hayAnio) {
         select =  "SELECT * FROM Reportes WHERE asesor='"+ nombre + "' AND mes=" + mes +
                 " AND anio=" + anio +
                 " ORDER BY anio, mes, dia";
    }
    else if (!hayMes && hayAnio) {
        select =  "SELECT * FROM Reportes WHERE asesor='"+ nombre + "' AND anio=" + anio +
                 " ORDER BY anio, mes, dia";
    }
    try {
     db.each(select,
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                var datosFecha = [row.dia , row.mes, row.anio];
                var fechaIn = datosFecha.join("/");
                // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var cantidad = row.hora_inicio.toString().split(".");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
                // hora fin
                var cantidad2 = row.hora_fin.toString().split(".")
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
                // hora fact
                var cantidad3 = row.h_fact.toString().split(".")
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                if (row.descripcion == undefined) {
                    var desc = "";
                }
                else {
                    var desc = row.descripcion;
                }
                reportesD.push({ 
                                asesor: row.asesor, 
                                cliente: row.cliente,
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                obs: desc,
                                hor_ini: hor_ini,
                                min_ini: min_ini,
                                hor_fin: hor_fin,
                                min_fin: min_fin,
                                hor_fact: hor_fact,
                                min_fact: min_fact
                            });
                            
                }
                    },function(err, num){
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }        
                        
                        if (reportesD.length == 0) {
                            reportesD.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });   
            
                        }
                        
                        
                        // Calculo total horas
            var total_horas_fact = 0;
            var total_minutos_fact = 0;
            var total_horas = 0;
            var total_minutos = 0;
            // Arreglo diario
            var dias = {};
            // Arreglo clientes
            var clientesR = {}; // Clientes y sus horas totales
            var clientesF = {}; // Clientes y sus fechas y horas parciales
            var i,j;
            for (i = 0; i < reportesD.length; i++) {
                
                //Vemos cliente y lo agregamos
                if (reportesD[i].cliente in clientesR) { // Cliente agregado
                    // Introducimos datos reporte
                    var strFecha = reportesD[i].fecha + " --- " + reportesD[i].hfact;
                    clientesF[reportesD[i].cliente].push(strFecha);
                    clientesR[reportesD[i].cliente][0] = clientesR[reportesD[i].cliente][0] 
                                                            + reportesD[i].hor_fact; // Horas
                    clientesR[reportesD[i].cliente][1] = clientesR[reportesD[i].cliente][1]
                                                            + reportesD[i].min_fact; // Minutos
                    // Vemos si minutos pasaron 60
                    if (clientesR[reportesD[i].cliente][1] >= 60) {
                        clientesR[reportesD[i].cliente][0] = clientesR[reportesD[i].cliente][0] 
                                                            + 1; // Horas
                        clientesR[reportesD[i].cliente][1] = clientesR[reportesD[i].cliente][1]
                                                            - 60; // Minutos
                    }
                }
                else { // Cliente no ha sido agregado
                    clientesF[reportesD[i].cliente] = [];    // Iniciamos arreglo vacio
                    clientesR[reportesD[i].cliente] = [0,0]; // Iniciamos horas y min en 0
                    // El arreglo guarda en [0] horas y en [1] minutos
                    // Introducimos datos reporte
                    var strFecha = reportesD[i].fecha + " --- " + reportesD[i].hfact;
                    clientesF[reportesD[i].cliente].push(strFecha);
                    clientesR[reportesD[i].cliente][0] = reportesD[i].hor_fact; // Horas
                    clientesR[reportesD[i].cliente][1] = reportesD[i].min_fact; // Minutos
                }
                
                
                // Vemos fecha y la agregamos
                dias[reportesD[i].fecha] = 1;
                
                
                var m_total = 0;
                var h_total = 0;
                if (reportesD[i].hor_fin > reportesD[i].hor_ini) {
                        if (reportesD[i].min_fin >= reportesD[i].min_ini) {
                            m_total = reportesD[i].min_fin -reportesD[i]. min_ini;
                            h_total = reportesD[i].hor_fin - reportesD[i].hor_ini;
                        } else {
                            h_total = reportesD[i].hor_fin - reportesD[i].hor_ini - 1;
                            m_total = 60 - (reportesD[i].min_ini - reportesD[i].min_fin);
                        }
                }
                else { // horas son iguales
                    h_total = 0;
                    m_total = reportesD[i].min_fin - reportesD[i].min_ini;
                }  
                 // Facturadas
                total_horas_fact = total_horas_fact + reportesD[i].hor_fact;
                total_minutos_fact = total_minutos_fact + reportesD[i].min_fact;
                //Totales
                total_horas = total_horas + h_total;
                total_minutos = total_minutos + m_total;
            }
            
            // Ordenamos resumen clientes
            var resumenClientes = [];
            for (var key in clientesR) {
                var strH = "";
                if (clientesR[key][1] >= 10) {
                    strH = clientesR[key][0] + ":" + clientesR[key][1];
                }
                else {
                    strH = clientesR[key][0] + ":0" + clientesR[key][1];    
                }
                
                
                resumenClientes.push({ 
                                cliente: key, 
                                strH: strH,
                                fechas: clientesF[key]
                            });
            }
            
            
            
            // Facturadas
            var h_adicional_fact = parseInt(total_minutos_fact/60,10);
            total_minutos_fact = total_minutos_fact % 60;
            total_horas_fact = total_horas_fact + h_adicional_fact;
            // Totales
            var h_adicional =  parseInt(total_minutos/60,10);
            total_minutos = total_minutos % 60;
            total_horas = total_horas + h_adicional;
            
            var str_hfact = total_horas_fact.toString() + " Hr. y " + total_minutos_fact.toString()
                                                       + " Min.";
        
            var str_htotal = total_horas.toString() + " Hr. y " + total_minutos.toString()
                                                       + " Min.";                                        
            
            var num_porcentaje = parseInt(total_horas_fact * 100 / 80,10);
            
            var str_porcentaje = "width: " + num_porcentaje.toString() + "%;";
            
            if (num_porcentaje < 50) {
                var estado = "bajo";
            }
            else if (num_porcentaje < 80) {
                var estado = "normal";    
            }
            else {
                var estado = "alto";    
            }
            
            // Vemos promedio
            var diasTrabajados = Object.keys(dias).length;
            var promedio = total_horas_fact / diasTrabajados;
            promedio = promedio.toFixed(2);
            
            if (promedio < 3) {
                var estadoP = "bajo";
            }
            else if (promedio < 4) {
                var estadoP = "normal";    
            }
            else {
                var estadoP = "alto";    
            }
            var tituloMes = "Histórico Reportes de " + nombre;
            if (hayMes) {
                            tituloMes = tituloMes + " de ";
                            if (mes == 1) {
                                tituloMes = tituloMes + "Enero";
                            }
                            if (mes == 2) {
                                tituloMes = tituloMes + "Febrero";
                            }
                            if (mes == 3) {
                                tituloMes = tituloMes + "Marzo";
                            }
                            if (mes == 4) {
                                tituloMes = tituloMes + "Abril";
                            }
                            if (mes == 5) {
                                tituloMes = tituloMes + "Mayo";
                            }
                            if (mes == 6) {
                                tituloMes = tituloMes + "Junio";
                            }
                            if (mes == 7) {
                                tituloMes = tituloMes + "Julio";
                            }
                            if (mes == 8) {
                                tituloMes = tituloMes + "Agosto";
                            }
                            if (mes == 9) {
                                tituloMes = tituloMes + "Septiembre";
                            }
                            if (mes == 10) {
                                tituloMes = tituloMes + "Octubre";
                            }
                            if (mes == 11) {
                                tituloMes = tituloMes + "Noviembre";
                            }
                            if (mes == 12) {
                                tituloMes = tituloMes + "Diciembre";
                            }
                        }
                        
                        if (hayAnio) {
                            tituloMes = tituloMes + " del " + anio;
                        }
                        
                        
                        if (hayMes) {
                            
                            
                            
            
            var datos={
                titulo: tituloMes, // asesor cliente fecha hini hfin hfact obs 
                reportes: reportesD,
                asesor: nombre,
                t_horas_fact: str_hfact,
                t_horas: str_htotal,
                porcentaje: str_porcentaje,
                horas: total_horas_fact,
                alto: "alto",
                bajo: "bajo",
                normal: "normal",
                estadoP: estadoP,
                dias: diasTrabajados,
                promedio: promedio,
                seguimiento: "Si",
                estado: estado,
                mes: mes,
                resumenClientes:  resumenClientes
            };
                            
                            
                        }
                        else {
                            
            
            var datos={
                titulo: tituloMes, // asesor cliente fecha hini hfin hfact obs 
                reportes: reportesD,
                asesor: nombre,
                t_horas_fact: str_hfact,
                t_horas: str_htotal,
                porcentaje: str_porcentaje,
                horas: total_horas_fact,
                alto: "alto",
                bajo: "bajo",
                normal: "normal",
                estadoP: estadoP,
                dias: diasTrabajados,
                promedio: promedio,
                seguimiento: "Si",
                estado: estado,
                resumenClientes:  resumenClientes
            };
                        }
              
              
                        respuesta.render('reporteshist', datos);
                    });         
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});



/*
 * HISTORICO ACTIVIDADES POR REPORTE
 * --------------------------
 */
app.post('/historicoSubirVerActividad', urlencodedParser, function(req, respuesta) {
    sess = req.session;
    var nombre = req.body.asesor;
    var cliente = req.body.cliente;
    var fecha = req.body.fecha;
    var fechaD = fecha.split("/");
    var dia = fechaD[0];
    var mes = fechaD[1];
    var anio = fechaD[2];
    var reportesD = [];
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    try {
        db.each("SELECT * FROM Actividades WHERE asesor = ? " +
                        "AND cliente = ? AND dia = ? AND mes = ? AND anio = ?",
                        [nombre,cliente,dia,mes,anio],
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo actividades"+"\n");
                            throw err;
                        }
                        else { 
                            reportesD.push({ 
                                obs: row.descripcion
                                });
                            }
                    },function(err, num){
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }              
                        if (reportesD.length == 0) {
                        reportesD.push({obs: '-'  }); 
                        }
                        
                        var tituloD = "Actividades";
        var datos={
           titulo: tituloD, // asesor cliente fecha hini hfin hfact obs 
           reportes: reportesD,
           asesor: nombre,
           cliente: cliente,
           fecha: fecha
        };
        
        respuesta.render('actclientehist', datos);
              
                    });
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});


/*
 * HISTORICO REPORTES POR CLIENTE
 * --------------------------
 */
app.post('/historicoSubirReportesCliente', urlencodedParser, function(req, respuesta) {
    sess = req.session;
    var cliente = req.body.cliente;
    var reportesD = [];
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    var lista = [];
    var listaReportes = [];
    try {
        var select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.cliente = '" + cliente  +"' "
                     " ORDER BY Clientes._id, anio, mes, dia DESC";
    var hayMes = true;
    var hayAnio = true;
    var mes = parseInt(req.body.mes, 10);
    var anio = parseInt(req.body.anio, 10);
    if (mes == undefined || isNaN(mes) || mes < 1 || mes > 12) { // Vemos mes
        hayMes = false;
    }
    if (anio == undefined || isNaN(anio) || anio < 2015 || anio > 2020) { // Vemos anio
        hayAnio = false;
    }
    if (hayMes && !hayAnio) {
        select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.cliente = '" + cliente  +"' AND mes=" + mes +
                     " ORDER BY Clientes._id,anio,mes,dia";
    }
    else if (hayMes && hayAnio) {
        select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.cliente = '" + cliente  +"' AND mes=" + mes +
                     " AND anio=" + anio +
                     " ORDER BY Clientes._id,anio,mes,dia";
    }
    else if (!hayMes && hayAnio) {
        select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.cliente = '" + cliente  +"' AND anio=" + anio +
                     " ORDER BY Clientes._id,anio,mes,dia";
    }
    
    
    
        var contadorReportes = 0;
        db.each(select, 
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                        var reporte = [row._id, row.nombre, row.asesor,
                                             row.descripcion,
                                             row.dia, row.mes, row.anio, 
                                             row.hora_inicio, row.hora_fin, row.h_fact];
                        lista.push(reporte);
                        contadorReportes = contadorReportes + 1;
                        }
                    },
                    function(err, num){ // Termine Todos los reportes
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }
                    var texto = "";   
                    // Ordenamos los reportes por fecha
                    lista.sort(function (a, b) {
                        if (a[6] > b[6]) {
                            return 1;
                        }
                        if (a[6] < b[6]) {
                            return -1;
                        }
                        // a must be equal to b
                        if (a[5] > b[5]) {
                            return 1;
                        }
                        if (a[5] < b[5]) {
                            return -1;
                        }
                        if (a[4] > b[4]) {
                            return 1;
                        }
                        if (a[4] < b[4]) {
                            return -1;
                        }
                        // a must be equal to b
                            return 0;
                        });
                    async.eachSeries(lista,
                        // Funcion donde cada elemento de lista es pasado
                     function(r, callback){
                         var lista_act = "";
                        // Vemos si actividad existe
                        db.each("SELECT descripcion  FROM Actividades WHERE asesor = ? " +
                        "AND cliente = ? AND dia = ? AND mes = ? AND anio = ? ",
                        [   r[2],r[1],r[4],
                            r[5],r[6]
                        ], 
                        function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                        lista_act = lista_act + row.descripcion + "\n";
                        }
                        },
                    function(err, num){ // Termine Todos las actividades
                        if (err){
                            console.log(err);
                            console.log("Error obteniendo actividades"+"\n");
                            callback();
                            throw err;
                        }
                        else {
                            var asesor = r[2];
                            var descripcion =r[3];
                            var datosFecha = [r[4] ,r[5],r[6]];
                            var fechaIn = datosFecha.join("/");
                    // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var entero = r[7].toString().split(".");
                var hor_ini = parseInt(entero[0],10);
                var min_ini = 0;
                if (entero.length > 1) {
                    if (entero[1].length > 1) {
                        min_ini = parseInt(entero[1],10);
                    }
                    else {
                        min_ini = parseInt(entero[1],10) * 10;
                    }
                }
                // hora fin
                var entero2 = r[8].toString().split(".");
                var hor_fin = parseInt(entero2[0],10);
                var min_fin = 0;
                if (entero2.length > 1) {
                    if (entero2[1].length > 1) {
                        min_fin = parseInt(entero2[1],10);
                    }
                    else {
                        min_fin = parseInt(entero2[1],10) * 10;
                    }
                }
                // hora fact
                var entero3 = r[9].toString().split(".");
                var hor_fact = parseInt(entero3[0],10);
                var min_fact = 0;
                if (entero3.length > 1) {
                    if (entero3[1].length > 1) {
                        min_fact = parseInt(entero3[1],10);
                    }
                    else {
                        min_fact = parseInt(entero3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var actividades = [];
                var hayActividades = false;
                // Vemos lineas de actividades si tiene    
                var linActividad = lista_act.split("|");
                if (linActividad[0] != "") { // Linea Actividad 
                    hayActividades = true;
                    actividades.push({
                        desc: linActividad[0]
                    });
                }
                if (hayActividades) {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion,
                        actividades: actividades
                    });
                }
                else {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion
                    });
                }
                callback(); // Termino ver 1 reporte
                
                            
                        }
                        
                        
                        
                        }
                        ); 
                    },
                    // Cuando terminaron todos los eliminar actividades
                    function(err){
                        if (err){
                            console.log(err);
                            respuesta.end("Error: Problemas en actividades"+ "\n");
                            db.close();
                        }
                        else{
        var tituloMes = "Histórico Actividades de " + cliente;
            if (hayMes) {
                            tituloMes = tituloMes + " de ";
                            if (mes == 1) {
                                tituloMes = tituloMes + "Enero";
                            }
                            if (mes == 2) {
                                tituloMes = tituloMes + "Febrero";
                            }
                            if (mes == 3) {
                                tituloMes = tituloMes + "Marzo";
                            }
                            if (mes == 4) {
                                tituloMes = tituloMes + "Abril";
                            }
                            if (mes == 5) {
                                tituloMes = tituloMes + "Mayo";
                            }
                            if (mes == 6) {
                                tituloMes = tituloMes + "Junio";
                            }
                            if (mes == 7) {
                                tituloMes = tituloMes + "Julio";
                            }
                            if (mes == 8) {
                                tituloMes = tituloMes + "Agosto";
                            }
                            if (mes == 9) {
                                tituloMes = tituloMes + "Septiembre";
                            }
                            if (mes == 10) {
                                tituloMes = tituloMes + "Octubre";
                            }
                            if (mes == 11) {
                                tituloMes = tituloMes + "Noviembre";
                            }
                            if (mes == 12) {
                                tituloMes = tituloMes + "Diciembre";
                            }
                        }
                        
                        if (hayAnio) {
                            tituloMes = tituloMes + " del " + anio;
                        }
                        
                        
                        if (hayMes) {
                            
                            
                            
            
           var datos={
           titulo: tituloMes, // asesor cliente fecha hini hfin hfact obs 
           mes: mes,
           reportes: listaReportes,
           cliente: cliente
        };
                            
                            
                        }
                        else {
                            
            
            var datos={
           titulo: tituloMes, // asesor cliente fecha hini hfin hfact obs 
           reportes: listaReportes,
           cliente: cliente
        };
                        }
              
                        
                        
                        
                        
        
        respuesta.render('actividades2hist', datos);
                            db.close();  
                            
                            
                            
                            
                            
                            
                            
                            
                        }
                    }); // Termino async actividades  
                    });
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});



/*
 * HISTORICO ACTIVIDADES POR ASESOR
 * --------------------------
 */
app.post('/historicoSubirActividadesAsesor', urlencodedParser, function(req, respuesta) {
    sess = req.session;
    var asesor = req.body.asesor;
    var reportesD = [];
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(file);
    var lista = [];
    var listaReportes = [];
    try {
        var select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.asesor = '" + asesor  +"' "
                     " ORDER BY Clientes._id,anio,mes,dia";
    var hayMes = true;
    var hayAnio = true;
    var mes = parseInt(req.body.mes, 10);
    var anio = parseInt(req.body.anio, 10);
    if (mes == undefined || isNaN(mes) || mes < 1 || mes > 12) { // Vemos mes
        hayMes = false;
    }
    if (anio == undefined || isNaN(anio) || anio < 2015 || anio > 2020) { // Vemos anio
        hayAnio = false;
    }
    if (hayMes && !hayAnio) {
        select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.asesor = '" + asesor  +"' AND mes=" + mes +
                     " ORDER BY Clientes._id,anio,mes,dia";
    }
    else if (hayMes && hayAnio) {
        select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.asesor = '" + asesor  +"' AND mes=" + mes +
                     " AND anio=" + anio  +
                     " ORDER BY Clientes._id,anio,mes,dia";
    }
    else if (!hayMes && hayAnio) {
        select = "SELECT Clientes._id, Clientes.nombre, Reportes.asesor," +
                     "Reportes.descripcion, Reportes.dia, Reportes.mes, "+ 
                     "Reportes.anio, Reportes.hora_inicio," +
                     "Reportes.hora_fin, Reportes.h_fact " +
                     " From Clientes JOIN Reportes ON Clientes.nombre = Reportes.cliente "+
                     " WHERE Reportes.asesor = '" + asesor  +
                     "' AND anio=" + anio  +
                     " ORDER BY Clientes._id,anio,mes,dia";
    }
        var contadorReportes = 0;
        db.each(select, 
                    function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                        var reporte = [row._id, row.nombre, row.asesor,
                                             row.descripcion,
                                             row.dia, row.mes, row.anio, 
                                             row.hora_inicio, row.hora_fin, row.h_fact];
                        lista.push(reporte);
                        contadorReportes = contadorReportes + 1;
                        }
                    },
                    function(err, num){ // Termine Todos los reportes
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");                            
                            respuesta.end();
                            throw err;
                        }
                    var texto = "";
                    // Ordenamos los reportes por fecha
                    lista.sort(function (a, b) {
                        if (a[1] > b[1]) {
                            return 1;
                        }
                        if (a[1] < b[1]) {
                            return -1;
                        }
                        // a must be equal to b
                        if (a[6] > b[6]) {
                            return 1;
                        }
                        if (a[6] < b[6]) {
                            return -1;
                        }
                        // a must be equal to b
                        if (a[5] > b[5]) {
                            return 1;
                        }
                        if (a[5] < b[5]) {
                            return -1;
                        }
                        if (a[4] > b[4]) {
                            return 1;
                        }
                        if (a[4] < b[4]) {
                            return -1;
                        }
                        // a must be equal to b
                            return 0;
                        });
                    async.eachSeries(lista,
                        // Funcion donde cada elemento de lista es pasado
                     function(r, callback){
                         var lista_act = "";
                        // Vemos si actividad existe
                        db.each("SELECT descripcion  FROM Actividades WHERE asesor = ? " +
                        "AND cliente = ? AND dia = ? AND mes = ? AND anio = ? ",
                        [   r[2],r[1],r[4],
                            r[5],r[6]
                        ], 
                        function(err, row) {
                        if (err){
                            console.log(err);
                            respuesta.write("Error obteniendo reportes"+"\n");
                            throw err;
                        }
                        else {
                        lista_act = lista_act + row.descripcion + "\n";
                        }
                        },
                    function(err, num){ // Termine Todos las actividades
                        if (err){
                            console.log(err);
                            console.log("Error obteniendo actividades"+"\n");
                            callback();
                            throw err;
                        }
                        else {
                            var asesor = r[2];
                            var cliente = r[1];
                            var descripcion =r[3];
                            var datosFecha = [r[4] ,r[5],r[6]];
                            var fechaIn = datosFecha.join("/");
                    // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var entero = r[7].toString().split(".");
                var hor_ini = parseInt(entero[0],10);
                var min_ini = 0;
                if (entero.length > 1) {
                    if (entero[1].length > 1) {
                        min_ini = parseInt(entero[1],10);
                    }
                    else {
                        min_ini = parseInt(entero[1],10) * 10;
                    }
                }
                // hora fin
                var entero2 = r[8].toString().split(".");
                var hor_fin = parseInt(entero2[0],10);
                var min_fin = 0;
                if (entero2.length > 1) {
                    if (entero2[1].length > 1) {
                        min_fin = parseInt(entero2[1],10);
                    }
                    else {
                        min_fin = parseInt(entero2[1],10) * 10;
                    }
                }
                // hora fact
                var entero3 = r[9].toString().split(".");
                var hor_fact = parseInt(entero3[0],10);
                var min_fact = 0;
                if (entero3.length > 1) {
                    if (entero3[1].length > 1) {
                        min_fact = parseInt(entero3[1],10);
                    }
                    else {
                        min_fact = parseInt(entero3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var actividades = [];
                var hayActividades = false;
                // Vemos lineas de actividades si tiene    
                var linActividad = lista_act.split("|");
                if (linActividad[0] != "") { // Linea Actividad 
                    hayActividades = true;
                    actividades.push({
                        desc: linActividad[0]
                    });
                }
                if (hayActividades) {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion,
                        actividades: actividades
                    });
                }
                else {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion
                    });
                }
                callback(); // Termino ver 1 reporte
                
                            
                        }
                        
                        
                        
                        }
                        ); 
                    },
                    // Cuando terminaron todos los eliminar actividades
                    function(err){
                        if (err){
                            console.log(err);
                            respuesta.end("Error: Problemas en actividades"+ "\n");
                            db.close();
                        }
                        else{
        var tituloMes = "Histórico Actividades de " + asesor;
            if (hayMes) {
                            tituloMes = tituloMes + " de ";
                            if (mes == 1) {
                                tituloMes = tituloMes + "Enero";
                            }
                            if (mes == 2) {
                                tituloMes = tituloMes + "Febrero";
                            }
                            if (mes == 3) {
                                tituloMes = tituloMes + "Marzo";
                            }
                            if (mes == 4) {
                                tituloMes = tituloMes + "Abril";
                            }
                            if (mes == 5) {
                                tituloMes = tituloMes + "Mayo";
                            }
                            if (mes == 6) {
                                tituloMes = tituloMes + "Junio";
                            }
                            if (mes == 7) {
                                tituloMes = tituloMes + "Julio";
                            }
                            if (mes == 8) {
                                tituloMes = tituloMes + "Agosto";
                            }
                            if (mes == 9) {
                                tituloMes = tituloMes + "Septiembre";
                            }
                            if (mes == 10) {
                                tituloMes = tituloMes + "Octubre";
                            }
                            if (mes == 11) {
                                tituloMes = tituloMes + "Noviembre";
                            }
                            if (mes == 12) {
                                tituloMes = tituloMes + "Diciembre";
                            }
                        }
                        
                        if (hayAnio) {
                            tituloMes = tituloMes + " del " + anio;
                        }
                        
                        
                        
                        if (hayMes) {
                            
                            
                            
            
           var datos={
           titulo: tituloMes, // asesor cliente fecha hini hfin hfact obs 
           mes: mes,
           reportes: listaReportes,
           asesor: asesor
        };
                            
                            
                        }
                        else {
                            
            
            var datos={
           titulo: tituloMes, // asesor cliente fecha hini hfin hfact obs 
           reportes: listaReportes,
            asesor: asesor
        };
                        }
              
                        
                        
                        
                        
        
        respuesta.render('actividades2hist', datos);
                            db.close();  
                            
                            
                            
                            
                            
                            
                            
                            
                        }
                    }); // Termino async actividades  
                    });
    } catch (err) {
        // manejamos error
        console.log(err);
    }
});






//////////////////////////////////// PAGINA BASICA (SIN HISTORICO)






/*
 * LISTA REPORTES
 * ---------------
 */
app.get('/subirReportes', function(req, res){
    sess = req.session;
    // Solicitud a servidor para ver controles
    request('http://controleshls.azurewebsites.net/subirReportes?', function (error, response, body) {
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var reportesD = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidadR = parseInt(cantidadRes[1], 10); 
            var contador = 1;
            while (contador <= cantidadR) {
                var transf = respuestas[contador].split("|");
                var datosFecha = [transf[3] ,transf[4],transf[5]];
                var fechaIn = datosFecha.join("/");
                // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var cantidad = transf[6].split(".");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
                // hora fin
                var cantidad2 = transf[7].split(".");
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
                // hora fact
                var cantidad3 = transf[9].split(".");
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                reportesD.push({ 
                                asesor: transf[1], 
                                cliente: transf[2],
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                obs: transf[8]
                            });
                contador = contador + 1;
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (reportesD.length == 0) {
        reportesD.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });   
            
        }
        
    /**  Datos Estaticos
      var datos={
           titulo:'Lista Reportes', // asesor cliente fecha hini hfin hfact obs 
           reportes: [
             { asesor: 'andres', cliente: 'EXIAUTO',fecha: '1/3/2017', 
                                    hini: '19:30', hfin: '20', 
                                    hfact: '0:30' , obs: 'Control Remoto'  },
             { asesor: 'Javier', cliente: 'DIALAN',fecha: '1/3/2017', 
                                    hfact: '0', obs: 'Remoto'  }               
           ]
        };
    */
        var datos={
           titulo:'Lista Reportes', // asesor cliente fecha hini hfin hfact obs 
           reportes: reportesD
        };
        res.render('reportes', datos);
    }
    else {
        res.render('error', { titulo: 'Lista Reportes', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});



/*
 * DESCARGAR RESUMEN REPORTES (TXT)
 * ----------------------------------
 */
app.get('/resumenReportes', function(req, res){
  res.redirect("http://controleshls.azurewebsites.net/resumenReportes");
});




/*
 * DESCARGAR BASE DE DATOS (SQLITE3)
 * ----------------------------------
 */
app.get('/baseDatos.db', function(req, res){
  res.redirect("http://controleshls.azurewebsites.net/baseDatos.db");
});




/*
 * LISTA REPORTES POR ASESOR
 * --------------------------
 */
app.post('/subirReportesAsesor', urlencodedParser, function(req, res) {
    sess = req.session;
    var nombre = req.body.asesor;
    var enSesion = req.body.enSesion;
    var edicion = false;
    if ((nombre == "enSesion" || enSesion == "enSesion") && sess.asesor) {
        nombre = sess.asesor;
        edicion = true;
    }
    var nombreD = "asesor=" + nombre;
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirReportesAsesor',
        body:    nombreD
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var reportesD = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidadR = parseInt(cantidadRes[1], 10); 
            var contador = 1;
            while (contador <= cantidadR) {
                var transf = respuestas[contador].split("|");
                var datosFecha = [transf[2] ,transf[3],transf[4]];
                var fechaIn = datosFecha.join("/");
                // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var cantidad = transf[5].split(".");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
                // hora fin
                var cantidad2 = transf[6].split(".");
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
                // hora fact
                var cantidad3 = transf[8].split(".");
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                if (edicion) {
                    reportesD.push({ 
                                asesor: nombre, 
                                cliente: transf[1],
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                obs: transf[7],
                                edicion: "Si",
                                hor_ini: hor_ini,
                                min_ini: min_ini,
                                hor_fin: hor_fin,
                                min_fin: min_fin,
                                hor_fact: hor_fact,
                                min_fact: min_fact
                            });    
                }
                else {
                    reportesD.push({ 
                                asesor: nombre, 
                                cliente: transf[1],
                                fecha: fechaIn, 
                                hini: msjH_ini, 
                                hfin: msjH_fin, 
                                hfact: msjH_fact,
                                obs: transf[7],
                                hor_ini: hor_ini,
                                min_ini: min_ini,
                                hor_fin: hor_fin,
                                min_fin: min_fin,
                                hor_fact: hor_fact,
                                min_fact: min_fact
                            });
                }
                contador = contador + 1;
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (reportesD.length == 0) {
        reportesD.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });   
            
        }
        var tituloD = "Reportes de " + nombre;
        //if (edicion) {
            
            // Calculo total horas
            var total_horas_fact = 0;
            var total_minutos_fact = 0;
            var total_horas = 0;
            var total_minutos = 0;
            // Arreglo diario
            var dias = {};
             // Arreglo clientes
            var clientesR = {}; // Clientes y sus horas totales
            var clientesF = {}; // Clientes y sus fechas y horas parciales
            var i,j;
            for (i = 0; i < reportesD.length; i++) {
                
                //Vemos cliente y lo agregamos
                if (reportesD[i].cliente in clientesR) { // Cliente agregado
                    // Introducimos datos reporte
                    var strFecha = reportesD[i].fecha + " --- " + reportesD[i].hfact;
                    clientesF[reportesD[i].cliente].push(strFecha);
                    clientesR[reportesD[i].cliente][0] = clientesR[reportesD[i].cliente][0] 
                                                            + reportesD[i].hor_fact; // Horas
                    clientesR[reportesD[i].cliente][1] = clientesR[reportesD[i].cliente][1]
                                                            + reportesD[i].min_fact; // Minutos
                    // Vemos si minutos pasaron 60
                    if (clientesR[reportesD[i].cliente][1] >= 60) {
                        clientesR[reportesD[i].cliente][0] = clientesR[reportesD[i].cliente][0] 
                                                            + 1; // Horas
                        clientesR[reportesD[i].cliente][1] = clientesR[reportesD[i].cliente][1]
                                                            - 60; // Minutos
                    }
                }
                else { // Cliente no ha sido agregado
                    clientesF[reportesD[i].cliente] = [];    // Iniciamos arreglo vacio
                    clientesR[reportesD[i].cliente] = [0,0]; // Iniciamos horas y min en 0
                    // El arreglo guarda en [0] horas y en [1] minutos
                    // Introducimos datos reporte
                    var strFecha = reportesD[i].fecha + " --- " + reportesD[i].hfact;
                    clientesF[reportesD[i].cliente].push(strFecha);
                    clientesR[reportesD[i].cliente][0] = reportesD[i].hor_fact; // Horas
                    clientesR[reportesD[i].cliente][1] = reportesD[i].min_fact; // Minutos
                }
                
                // Vemos fecha y la agregamos
                dias[reportesD[i].fecha] = 1;
                
                
                var m_total = 0;
                var h_total = 0;
                if (reportesD[i].hor_fin > reportesD[i].hor_ini) {
                        if (reportesD[i].min_fin >= reportesD[i].min_ini) {
                            m_total = reportesD[i].min_fin -reportesD[i]. min_ini;
                            h_total = reportesD[i].hor_fin - reportesD[i].hor_ini;
                        } else {
                            h_total = reportesD[i].hor_fin - reportesD[i].hor_ini - 1;
                            m_total = 60 - (reportesD[i].min_ini - reportesD[i].min_fin);
                        }
                }
                else { // horas son iguales
                    h_total = 0;
                    m_total = reportesD[i].min_fin - reportesD[i].min_ini;
                }  
                 // Facturadas
                total_horas_fact = total_horas_fact + reportesD[i].hor_fact;
                total_minutos_fact = total_minutos_fact + reportesD[i].min_fact;
                //Totales
                total_horas = total_horas + h_total;
                total_minutos = total_minutos + m_total;
            }
            
            // Ordenamos resumen clientes
            var resumenClientes = [];
           for (var key in clientesR) {
                var strH = "";
                if (clientesR[key][1] >= 10) {
                    strH = clientesR[key][0] + ":" + clientesR[key][1];
                }
                else {
                    strH = clientesR[key][0] + ":0" + clientesR[key][1];    
                }
                
                
                resumenClientes.push({ 
                                cliente: key, 
                                strH: strH,
                                fechas: clientesF[key]
                            });
            }
            
            // Facturadas
            var h_adicional_fact = parseInt(total_minutos_fact/60,10);
            total_minutos_fact = total_minutos_fact % 60;
            total_horas_fact = total_horas_fact + h_adicional_fact;
            // Totales
            var h_adicional =  parseInt(total_minutos/60,10);
            total_minutos = total_minutos % 60;
            total_horas = total_horas + h_adicional;
            
            var str_hfact = total_horas_fact.toString() + " Hr. y " + total_minutos_fact.toString()
                                                       + " Min.";
        
            var str_htotal = total_horas.toString() + " Hr. y " + total_minutos.toString()
                                                       + " Min.";                                        
            
            var num_porcentaje = parseInt(total_horas_fact * 100 / 80,10);
            
            var str_porcentaje = "width: " + num_porcentaje.toString() + "%;";
            
            if (num_porcentaje < 50) {
                var estado = "bajo";
            }
            else if (num_porcentaje < 80) {
                var estado = "normal";    
            }
            else {
                var estado = "alto";    
            }
            
            // Vemos promedio
            var diasTrabajados = Object.keys(dias).length;
            var promedio = total_horas_fact / diasTrabajados;
            promedio = promedio.toFixed(2);
            
            if (promedio < 3) {
                var estadoP = "bajo";
            }
            else if (promedio < 4) {
                var estadoP = "normal";    
            }
            else {
                var estadoP = "alto";    
            }
            
            if (edicion) {
            
            var datos={
                titulo: tituloD, // asesor cliente fecha hini hfin hfact obs 
                reportes: reportesD,
                edicion: "Si",
                t_horas_fact: str_hfact,
                t_horas: str_htotal,
                porcentaje: str_porcentaje,
                horas: total_horas_fact,
                alto: "alto",
                bajo: "bajo",
                normal: "normal",
                estadoP: estadoP,
                dias: diasTrabajados,
                promedio: promedio,
                seguimiento: "Si",
                estado: estado,
                resumenClientes:  resumenClientes
            };    
            
            
        }
        else {
            var datos={
                titulo: tituloD, // asesor cliente fecha hini hfin hfact obs 
                reportes: reportesD,
                t_horas_fact: str_hfact,
                t_horas: str_htotal,
                porcentaje: str_porcentaje,
                horas: total_horas_fact,
                alto: "alto",
                bajo: "bajo",
                normal: "normal",
                estadoP: estadoP,
                dias: diasTrabajados,
                promedio: promedio,
                seguimiento: "Si",
                estado: estado,
                resumenClientes:  resumenClientes
            };
        }
        res.render('reportes', datos);
    }
    else {
        res.render('error', { titulo: 'Lista Reportes', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});



/*
 * LISTA ACTIVIDADES POR ASESOR
 * --------------------------
 */
app.post('/subirActividadesAsesor', urlencodedParser, function(req, res) {
    sess = req.session;
    var nombre = req.body.asesor;
    var nombreD = "user=" + nombre;
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/resumenReportesAsesor',
        body:    nombreD
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var reportesD = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        var listaReportes = [];
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidad = parseInt(cantidadRes[1], 10); 
            var contador = 0;
            var linea = 1;
            while (contador < cantidad) {
                var transf = respuestas[linea].split("|");
                if (transf[0] == "") { // Linea Reporte
                    linea = linea + 1;
                    var cliente = transf[2];
                    var descripcion = transf[4];
                    var datosFecha = [transf[5] ,transf[6],transf[7]];
                    var fechaIn = datosFecha.join("/");
                    // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var entero = transf[8].split(".");
                var hor_ini = parseInt(entero[0],10);
                var min_ini = 0;
                if (entero.length > 1) {
                    if (entero[1].length > 1) {
                        min_ini = parseInt(entero[1],10);
                    }
                    else {
                        min_ini = parseInt(entero[1],10) * 10;
                    }
                }
                // hora fin
                var entero2 = transf[9].split(".");
                var hor_fin = parseInt(entero2[0],10);
                var min_fin = 0;
                if (entero2.length > 1) {
                    if (entero2[1].length > 1) {
                        min_fin = parseInt(entero2[1],10);
                    }
                    else {
                        min_fin = parseInt(entero2[1],10) * 10;
                    }
                }
                // hora fact
                var entero3 = transf[10].split(".");
                var hor_fact = parseInt(entero3[0],10);
                var min_fact = 0;
                if (entero3.length > 1) {
                    if (entero3[1].length > 1) {
                        min_fact = parseInt(entero3[1],10);
                    }
                    else {
                        min_fact = parseInt(entero3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var actividades = [];
                var hayActividades = false;
                // Vemos lineas de actividades si tiene    
                var linActividad = respuestas[linea].split("|");
                while (linActividad[0] != "") { // Linea Actividad 
                    hayActividades = true;
                    actividades.push({
                        desc: linActividad[0]
                    });
                    linea = linea + 1;
                    linActividad = respuestas[linea].split("|");
                }
                if (hayActividades) {
                    listaReportes.push({
                        asesor: nombre, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion,
                        actividades: actividades
                    });
                }
                else {
                    listaReportes.push({
                        asesor: nombre, 
                        cliente: cliente,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion
                    });
                }
                contador = contador + 1;
            }
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (listaReportes.length == 0) {
        listaReportes.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });     
            
        }
        var tituloD = "Actividades de " + nombre;
        var datos={
           titulo: tituloD, // asesor cliente fecha hini hfin hfact obs 
           reportes: listaReportes
        };
        res.render('actividades2', datos);
    }
    else {
        res.render('error', { titulo: 'Lista Actividades', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});


/*
 * LISTA REPORTES POR CLIENTE
 * --------------------------
 */
app.post('/subirReportesCliente', urlencodedParser, function(req, res) {
    sess = req.session;
    var nombre = req.body.cliente;
    var nombreD = "cliente=" + nombre;
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/resumenReportesCliente',
        body:    nombreD
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var reportesD = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        var listaReportes = [];
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidad = parseInt(cantidadRes[1], 10); 
            var contador = 0;
            var linea = 1;
            while (contador < cantidad) {
                var transf = respuestas[linea].split("|");
                if (transf[0] == "") { // Linea Reporte
                    linea = linea + 1;
                    var asesor = transf[3];
                    var descripcion = transf[4];
                    var datosFecha = [transf[5] ,transf[6],transf[7]];
                    var fechaIn = datosFecha.join("/");
                    // Horas
                var msjH_ini = "";
                var msjH_fin = "";
                var msjH_fact = "";
                var entero = transf[8].split(".");
                var hor_ini = parseInt(entero[0],10);
                var min_ini = 0;
                if (entero.length > 1) {
                    if (entero[1].length > 1) {
                        min_ini = parseInt(entero[1],10);
                    }
                    else {
                        min_ini = parseInt(entero[1],10) * 10;
                    }
                }
                // hora fin
                var entero2 = transf[9].split(".");
                var hor_fin = parseInt(entero2[0],10);
                var min_fin = 0;
                if (entero2.length > 1) {
                    if (entero2[1].length > 1) {
                        min_fin = parseInt(entero2[1],10);
                    }
                    else {
                        min_fin = parseInt(entero2[1],10) * 10;
                    }
                }
                // hora fact
                var entero3 = transf[10].split(".");
                var hor_fact = parseInt(entero3[0],10);
                var min_fact = 0;
                if (entero3.length > 1) {
                    if (entero3[1].length > 1) {
                        min_fact = parseInt(entero3[1],10);
                    }
                    else {
                        min_fact = parseInt(entero3[1],10) * 10;
                    }
                }
                if (min_fin >= 10) {
                    msjH_fin = hor_fin + ":" + min_fin;
                }
                else {
                    msjH_fin = hor_fin + ":0" + min_fin;
                }
                if (min_ini >= 10) {
                    msjH_ini = hor_ini + ":" + min_ini;
                }
                else {
                    msjH_ini = hor_ini + ":0" + min_ini;
                }
                if (min_fact >= 10) {
                    msjH_fact = hor_fact + ":" + min_fact;
                }
                else {
                    msjH_fact = hor_fact + ":0" + min_fact;
                }
                var actividades = [];
                var hayActividades = false;
                // Vemos lineas de actividades si tiene    
                var linActividad = respuestas[linea].split("|");
                while (linActividad[0] != "") { // Linea Actividad 
                    hayActividades = true;
                    actividades.push({
                        desc: linActividad[0]
                    });
                    linea = linea + 1;
                    linActividad = respuestas[linea].split("|");
                }
                if (hayActividades) {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: nombre,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion,
                        actividades: actividades
                    });
                }
                else {
                    listaReportes.push({
                        asesor: asesor, 
                        cliente: nombre,
                        fecha: fechaIn, 
                        hini: msjH_ini, 
                        hfin: msjH_fin, 
                        hfact: msjH_fact,
                        obs: descripcion
                    });
                }
                contador = contador + 1;
            }
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (listaReportes.length == 0) {
        listaReportes.push({asesor: '-', cliente: '-',fecha: '-', 
                                    hini: '-', hfin: '-', 
                                    hfact: '-' , obs: '-'  });     
            
        }
        var tituloD = "Actividades de " + nombre;
        var datos={
           titulo: tituloD, // asesor cliente fecha hini hfin hfact obs 
           reportes: listaReportes
        };
        res.render('actividades2', datos);
    }
    else {
        res.render('error', { titulo: 'Lista Actividades', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});



/*
 * VER ACTIVIDADES POR REPORTE
 * --------------------------
 */
app.post('/subirVerActividad', urlencodedParser, function(req, res) {
    sess = req.session;
    var nombre = req.body.asesor;
    var cliente = req.body.cliente;
    var fecha = req.body.fecha;
    var fechaD = fecha.split("/");
    var dia = fechaD[0];
    var mes = fechaD[1];
    var anio = fechaD[2];
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirVerActividad',
        form:    
            {
                asesor: nombre,
                cliente: cliente,
                dia: dia,
                mes: mes,
                anio: anio
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var reportesD = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidad = parseInt(cantidadRes[1], 10)+1; 
            var contador = 2;
            while (contador <= cantidad) {
                var transf = respuestas[contador].split("|");
                reportesD.push({ 
                                obs: transf[1]
                            });
                contador = contador + 1;
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (reportesD.length == 0) {
        reportesD.push({obs: '-'  });   
            
        }
        var tituloD = "Actividades";
        var datos={
           titulo: tituloD, // asesor cliente fecha hini hfin hfact obs 
           reportes: reportesD,
           asesor: nombre,
           cliente: cliente,
           fecha: fecha
        };
        res.render('actcliente', datos);
    }
    else {
        res.render('error', { titulo: 'Lista Actividades', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});

/*
 * CREAR Reporte
 * ---------------
 */ 
app.post('/crearReporte', urlencodedParser, function(req, res){
    sess = req.session;
    var fecha = req.body.fecha;
    console.log(req.body);
    // Lista clientes
  var horas = [];
  var contador = 0;
  while (contador < 24) {
      var strContador = contador.toString();
      if (contador < 10) {
          strContador = "0" + strContador;
      }
      horas.push( {hora: strContador} );
      contador = contador + 1;
  }
  
  var minutos = [];
  contador = 0;
  while (contador < 60) {
      var strContador = contador.toString();
      if (contador < 10) {
          strContador = "0" + strContador;
      }
      minutos.push( {minuto: strContador} );
      contador = contador + 1;
  }
  
  if (sess.asesor) {
      if (fecha == undefined || fecha == "" ) { // Vemosfecha
         return res.render('editreporte', { titulo: 'Crear Reporte',
                        horas: horas,
                        minutos: minutos,
                        clientes: clientesD,
                        asesor: sess.asesor,
                        tarea: 'Crear',
                        crear: 'Si'
      
        });
      }
      else {
          return res.render('editreporte', { titulo: 'Crear Reporte',
                        horas: horas,
                        minutos: minutos,
                        clientes: clientesD,
                        asesor: sess.asesor,
                        fecha: fecha,
                        tarea: 'Crear',
                        crear: 'Si'
         });
      }
      
       
  }
  else {
      res.render('error', { titulo: 'Crear Reporte', 
            error: 'Asesor no logueado' });
  }
  
  
  

  
  
  
});


/*
 * Despues de haber creado reporte
 * ---------------
 */ 
app.post('/reporteCreado', urlencodedParser, function(req, res){
    sess = req.session;
    console.log(req.body);
    var cliente = req.body.cliente;
    var asesor = req.body.asesor;
    if (sess.password) {
        var clave = sess.password;
    }
    else {
        return res.render('error', { titulo: 'Crear Reporte', 
            error: 'Asesor no logueado' });
    }
    var fecha = req.body.fecha;
    var fechaD = fecha.split("/");
    var dia = fechaD[0];
    var mes = fechaD[1];
    var anio = fechaD[2];
    var hini = "" + req.body.hini + "." + req.body.mini;
    var hfin = "" + req.body.hfin + "." + req.body.mfin;
    var hfact= "" + req.body.hfact + "." + req.body.mfact;
    var obs= "" + req.body.obs;
    
    if (obs.includes("|") || obs.includes("\n")) {
        obs = obs.replace("|"," ");
        obs = obs.replace("\n"," ");
    }
    if (fecha == "" || fecha == undefined) {
        console.log("ERROR: fecha vacía");
        return res.render("error", { titulo: 'Crear Reporte', 
                error: "Fecha no definida" });
    }
    if (cliente == "" || cliente == undefined) {
         console.log("ERROR: Cliente vacío");
         return res.render("error", { titulo: 'Crear Reporte', 
                error: "Cliente no definido" });
    }
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirReporte',
        form:    
            {
                asesor: asesor,
                cliente: cliente,
                dia: dia,
                mes: mes,
                anio: anio,
                password: clave,
                hora_inicio: hini,
                hora_fin: hfin,
                hora_fact: hfact,
                descripcion: obs
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var msj = "Operación Fallida"
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Reporte Exitoso" == respuestas[0]) { // Vemos Reportes
            res.redirect(307,"editarActividad");
        }
        else {
            console.log("ERROR: " + respuestas[0]);
            res.render("error", { titulo: 'Crear Reporte', 
                error: respuestas[0] });
        }
    
    }
    else {
        res.render('error', { titulo: 'Crear Reporte', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});



/*
 * Despues de haber editado reporte
 * ---------------
 */ 
app.post('/reporteEditado', urlencodedParser, function(req, res){
    sess = req.session;
    console.log(req.body);
    var cliente = req.body.cliente;
    var asesor = req.body.asesor;
    if (sess.password) {
        var clave = sess.password;
    }
    else {
        return res.render('error', { titulo: 'Crear Reporte', 
            error: 'Asesor no logueado' });
    }
    var fecha = req.body.fecha;
    var fechaD = fecha.split("/");
    var diaN = fechaD[0];
    var mesN = fechaD[1];
    var anioN = fechaD[2];
    var fechaAnterior = req.body.fechaAnterior;
    var fechaA = fechaAnterior.split("/");
    var dia = fechaA[0];
    var mes = fechaA[1];
    var anio = fechaA[2];
    var hini = "" + req.body.hini + "." + req.body.mini;
    var hfin = "" + req.body.hfin + "." + req.body.mfin;
    var hfact= "" + req.body.hfact + "." + req.body.mfact;
    var obs= "" + req.body.obs;
    
    if (obs.includes("|") || obs.includes("\n")) {
        obs = obs.replace("|"," ");
        obs = obs.replace("\n"," ");
    }
    if (fecha == "" || fecha == undefined) {
        console.log("ERROR: fecha vacía");
        return res.render("error", { titulo: 'Editar Reporte', 
                error: "Fecha no definida" });
    }
    if (cliente == "" || cliente == undefined) {
         console.log("ERROR: Cliente vacío");
         return res.render("error", { titulo: 'Editar Reporte', 
                error: "Cliente no definido" });
    }
    
    var datosSolicitud = {
                asesor: asesor,
                cliente: cliente,
                dia: dia,
                mes: mes,
                anio: anio,
                diaN: diaN,
                mesN: mesN,
                anioN: anioN,
                password: clave,
                hora_inicio: hini,
                hora_fin: hfin,
                hora_fact: hfact,
                descripcion: obs
            };
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirEditarReporte',
        form:  datosSolicitud
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var msj = "Operación Fallida"
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Reporte Actualizado" == respuestas[0]) { // Vemos Reportes
             res.redirect(307,"subirReportesAsesor");
        }
        else {
            console.log("ERROR: " + respuestas[0]);
            res.render("error", { titulo: 'Editar Reporte', 
                error: respuestas[0] });
        }
    
    }
    else {
        res.render('error', { titulo: 'Editar Reporte', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});


/*
 * Despues de haber eliminado reporte
 * ---------------
 */ 
app.post('/reporteEliminado', urlencodedParser, function(req, res){
    sess = req.session;
    console.log(req.body);
    var cliente = req.body.cliente;
    var asesor = req.body.asesor;
    if (sess.password) {
        var clave = sess.password;
    }
    else {
        return res.render('error', { titulo: 'Eliminar Reporte', 
            error: 'Asesor no logueado' });
    }
    var fecha = req.body.fecha;
    var fechaD = fecha.split("/");
    var dia = fechaD[0];
    var mes = fechaD[1];
    var anio = fechaD[2];
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirEliminarReporte',
        form:    
            {
                asesor: asesor,
                cliente: cliente,
                dia: dia,
                mes: mes,
                anio: anio,
                password: clave
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var msj = "Operación Fallida"
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Reporte Eliminado" == respuestas[0]) { // Vemos Reportes
            res.redirect(307,"subirReportesAsesor");
        }
        else {
            console.log("ERROR: " + respuestas[0]);
            res.render("error", { titulo: 'Eliminar Reporte', 
                error: respuestas[0] });
        }
    
    }
    else {
        res.render('error', { titulo: 'Eliminar Reporte', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});


/*
 * Crear Nueva Actividad
 * ---------------
 */ 
app.post('/nuevaActividad', urlencodedParser, function(req, res){
    sess = req.session;
    console.log(req.body);
    var cliente = req.body.cliente;
    var asesor = req.body.asesor;
    if (sess.password) {
        var clave = sess.password;
    }
    else {
        return res.render('error', { titulo: 'Crear Actividad', 
            error: 'Asesor no logueado' });
    }
    var fecha = req.body.fecha;
    var fechaD = fecha.split("/");
    var dia = fechaD[0];
    var mes = fechaD[1];
    var anio = fechaD[2];
    var obs= "" + req.body.obs;
    
    if (obs.includes("|") || obs.includes("\n")) {
        obs = obs.replace("|","-");
        obs = obs.replace("\n"," ");
    }
    
    if (obs == ("")) {
        obs = " ";
    }
    
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirActividad',
        form:    
            {
                asesor: asesor,
                cliente: cliente,
                dia: dia,
                mes: mes,
                anio: anio,
                password: clave,
                descripcion: obs
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var msj = "Operación Fallida"
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Reporte Exitoso" == respuestas[0]) { // Vemos Reportes
            res.redirect(307,"editarActividad");
        }
        else {
            console.log("ERROR: " + respuestas[0]);
            res.render("error", { titulo: 'Crear Reporte', 
                error: respuestas[0] });
        }
    
    }
    else {
        res.render('error', { titulo: 'Crear Reporte', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});

/*
 * Eliminar Actividad
 * ---------------
 */ 
app.post('/eliminarActividad', urlencodedParser, function(req, res){
    sess = req.session;
    var asesor = req.body.asesor;
    var id = req.body.id;
    var fecha = req.body.fecha;
    var cliente = req.body.cliente;
    if (sess.password) {
        var clave = sess.password;
    }
    else {
        return res.render('error', { titulo: 'Eliminar Actividad', 
            error: 'Asesor no logueado' });
    }
    var datos = {
                asesor: asesor,
                id: id,
                password: clave,
            };
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirEliminarActividad',
        form:   datos 
            
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var msj = "Operación Fallida"
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Actividad Eliminada" == respuestas[0]) { // Vemos Reportes
            res.redirect(307,"editarActividad");
        }
        else {
            console.log("ERROR: " + respuestas[0]);
            res.render("error", { titulo: 'Crear Reporte', 
                error: respuestas[0] });
        }
    
    }
    else {
        res.render('error', { titulo: 'Eliminar Actividad', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
    
});




/*
 * EDITAR ACTIVIDADES REPORTE
 * --------------------------
 */
app.post('/editarActividad', urlencodedParser, function(req, res) {
    sess = req.session;
    var nombre = req.body.asesor;
    var cliente = req.body.cliente;
    var fecha = req.body.fecha;
    var fechaD = fecha.split("/");
    var dia = fechaD[0];
    var mes = fechaD[1];
    var anio = fechaD[2];
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirVerActividad',
        form:    
            {
                asesor: nombre,
                cliente: cliente,
                dia: dia,
                mes: mes,
                anio: anio
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    
    var reportesD = [];
    // Si la solicitud fue exitosa parseamos el resultado
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        var cantidadRes = respuestas[0].split("|"); // Vemos cantidad
        if ("Cantidad de Reportes" == cantidadRes[0]) { // Vemos Reportes
            var cantidad = parseInt(cantidadRes[1], 10)+1; 
            var contador = 2;
            while (contador <= cantidad) {
                var transf = respuestas[contador].split("|");
                reportesD.push({ 
                                asesor: nombre,
                                id:  transf[0],
                                fecha: fecha,
                                cliente: cliente,
                                obs: transf[1]
                            });
                contador = contador + 1;
            }
        } else {
            console.log("ERROR: " + respuestas[0]);
        }
        if (reportesD.length == 0) {
        reportesD.push({obs: '-'});   
        }
        var tituloD = "Actividades";
        var datos={
           titulo: tituloD, // asesor cliente fecha hini hfin hfact obs 
           reportes: reportesD,
           asesor: nombre,
           cliente: cliente,
           fecha: fecha
        };
        
        if (sess.asesor && sess.asesor == nombre) {
            res.render('editaract', datos);    
        }
        else {
            res.render('error', { titulo: 'Editar Actividades', 
                error: 'Asesor no logueado' });
        }
    }
    else {
        res.render('error', { titulo: 'Lista Actividades', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});


/*
 * EDITAR REPORTE
 * --------------------------
 */
app.post('/editarReporte', urlencodedParser, function(req, res) {
    sess = req.session;
    
    var asesor = req.body.asesor;
    var cliente = req.body.cliente;
    var fecha = req.body.fecha;
    
    //Hora inicial
    var cantidad = req.body.hini.split(":");
                var hor_ini = parseInt(cantidad[0],10);
                var min_ini = 0;
                if (cantidad.length > 1) {
                    if (cantidad[1].length > 1) {
                        min_ini = parseInt(cantidad[1],10);
                    }
                    else {
                        min_ini = parseInt(cantidad[1],10) * 10;
                    }
                }
    var str_hini = hor_ini.toString();
    if (hor_ini < 10) {
          str_hini = "0" + str_hini;
    }
    var str_mini = min_ini.toString();
    if (min_ini < 10) {
          str_mini = "0" + str_mini;
    }
    
    //Hora final
    var cantidad2 = req.body.hfin.split(":");
                var hor_fin = parseInt(cantidad2[0],10);
                var min_fin = 0;
                if (cantidad2.length > 1) {
                    if (cantidad2[1].length > 1) {
                        min_fin = parseInt(cantidad2[1],10);
                    }
                    else {
                        min_fin = parseInt(cantidad2[1],10) * 10;
                    }
                }
    var str_hfin = hor_fin.toString();
    if (hor_fin < 10) {
          str_hfin = "0" + str_hfin;
    }
    var str_mfin = min_fin.toString();
    if (min_fin < 10) {
          str_mfin = "0" + str_mfin;
    }
    
    //Hora fact
    var cantidad3 = req.body.hfact.split(":");
                var hor_fact = parseInt(cantidad3[0],10);
                var min_fact = 0;
                if (cantidad3.length > 1) {
                    if (cantidad3[1].length > 1) {
                        min_fact = parseInt(cantidad3[1],10);
                    }
                    else {
                        min_fact = parseInt(cantidad3[1],10) * 10;
                    }
                }
    var str_hfact = hor_fact.toString();
    if (hor_fact < 10) {
          str_hfact = "0" + str_hfact;
    }
    var str_mfact = min_fact.toString();
    if (min_fact < 10) {
          str_mfact = "0" + str_mfact;
    }
    
    
    
    var obs= "" + req.body.obs;

  // Lista clientes
  var horas = [];
  var contador = 0;
  while (contador < 24) {
      var strContador = contador.toString();
      if (contador < 10) {
          strContador = "0" + strContador;
      }
      horas.push( {hora: strContador} );
      contador = contador + 1;
  }
  
  var minutos = [];
  contador = 0;
  while (contador < 60) {
      strContador = contador.toString();
      if (contador < 10) {
          strContador = "0" + strContador;
      }
      minutos.push( {minuto: strContador} );
      contador = contador + 1;
  }
  
  if (sess.asesor && sess.asesor == asesor) {
        res.render('editreporte', { titulo: 'Editar Reporte',
                        horas: horas,
                        minutos: minutos,
                        clientes: clientesD,
                        asesor: sess.asesor,
                        tarea: 'Guardar Cambios',
                        cliente: cliente,
                        asesor: asesor,
                        fecha: fecha,
                        h_ini: str_hini,
                        m_ini: str_mini,
                        h_fin: str_hfin,
                        m_fin: str_mfin,
                        h_fact: str_hfact,
                        m_fact: str_mfact,
                        obser: obs
        });
  }
  else {
      res.render('error', { titulo: 'Editar Reporte', 
            error: 'Asesor no logueado' });
  }
    
    
    
    
    
});


/*
 * LOGIN
 * ---------------
 */ 
app.post('/login', urlencodedParser, function(req, res){
    sess = req.session;
    var asesor = req.body.asesor;
    var clave = req.body.clave;
    
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirLogin',
        form:    
            {
                user: asesor,
                password: clave,
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    var msj = "Operación Fallida";
    // Vemos si la solicitud fue exitosa 
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Login Exitoso" == respuestas[0]) { // Vemos Reportes
            msj = "Login Exitoso";
            sess.asesor = asesor;
            sess.password = clave;
            res.redirect("/");
        }
        else {
            console.log("ERROR: " + body);
            res.render("error", { titulo: 'Crear Reporte', 
                error: body });
        }
    
    }
    else {
        res.render('error', { titulo: 'Login', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
});



/*
 * SALIR
 * ---------------
 */ 
app.get('/salir', function(req, res){
  req.session.destroy();
  res.redirect("/");
});


/*
 * REGISTRO
 * ---------------
 */ 
app.get('/registro', function(req, res){
  req.session.destroy(); // Cerramos sesion anterior
  res.render("registro");
});

/*
 * DESPUES REGISTRO
 * ---------------
 */ 
app.post('/subirRegistro', urlencodedParser,  function(req, res){
    sess = req.session;
  
    var nombre = req.body.nombre;
    var asesor = req.body.user;
    var clave = req.body.password;
    
    
    if (nombre.includes("|") || nombre.includes("\n")) {
        return res.render('error', { titulo: 'Registro', 
            error: 'Nombre no puede tener (|) o saltos de línea' });
    }
    if (asesor.includes("|") || asesor.includes("\n") || asesor.includes(" ")) {
        return res.render('error', { titulo: 'Registro', 
            error: 'Usuario no puede tener pipe (|), espacios en blanco o saltos de línea' });
    }
    if (asesor  == undefined || asesor == "" || asesor.length < 2) {
        return res.render('error', { titulo: 'Registro', 
            error: 'Usuario vacío' });
    }
    if (nombre  == undefined || nombre == "" || nombre.length < 2) {
        return res.render('error', { titulo: 'Registro', 
            error: 'Usuario vacío' });
    }
    if (clave  == undefined || clave == "" || clave.length < 4 || clave.includes(" ") || clave.includes("\n")) {
        return res.render('error', { titulo: 'Registro', 
            error: 'Clave no válida, debe ser mayor de 4 caracteres y no tener espacios en blanco' });
    }
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/subirRegistro',
        form:    
            {
                nombre: nombre,
                user: asesor,
                password: clave
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    var msj = "Operación Fallida";
    // Vemos si la solicitud fue exitosa 
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Registro Exitoso" == respuestas[0]) { // Vemos Reportes
            msj = "Registro Exitoso";
            sess.asesor = asesor;
            sess.password = clave;
            res.redirect("/");
        }
        else {
            console.log("ERROR: " + body);
            res.render("error", { titulo: 'Registro', 
                error: body });
        }
    
    }
    else {
        res.render('error', { titulo: 'Registro', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
  
  
});



/*
 * Cambio Clave
 * ---------------
 */ 
app.get('/cambioClave', function(req, res){
  req.session.destroy(); // Cerramos sesion anterior
  res.render("cambioclave");
});

/*
 * Despues Cambio clave
 * ---------------
 */ 
app.post('/subirCambioClave', urlencodedParser,  function(req, res){
    sess = req.session;
    var asesor = req.body.user;
    var clave = req.body.password;
    var codigo = req.body.codigo;
    
    if (asesor  == undefined || asesor == "" || asesor.length < 2) {
        return res.render('error', { titulo: 'Cambio Clave', 
            error: 'Usuario vacío' });
    }
    if (clave  == undefined || clave == "" || clave.length < 4 || clave.includes(" ") || clave.includes("\n")) {
        return res.render('error', { titulo: 'Cambio Clave', 
            error: 'Clave no válida, debe ser mayor de 4 caracteres y no tener espacios en blanco' });
    }
    if (codigo  == undefined || codigo == "" || codigo.length < 4 || codigo.includes(" ") || codigo.includes("\n")) {
        return res.render('error', { titulo: 'Cambio Clave', 
            error: 'Codigo no válido' });
    }
    // Solicitud a servidor
    request.post({
        url:     'http://controleshls.azurewebsites.net/cambioClave',
        form:    
            {
                codigo: codigo,
                user: asesor,
                password: clave
            }
    }, function(error, response, body){
    console.log('error:', error); // Imprime error si ocurre
    console.log('statusCode:', response && response.statusCode); // Codigo de la respuesta
    console.log('body:', body); // Cuerpo de la respuesta
    var msj = "Operación Fallida";
    // Vemos si la solicitud fue exitosa 
    if (response && response.statusCode) {
        var respuestas = body.split("\n");
        if ("Cambio Exitoso" == respuestas[0]) { // Vemos Reportes
            msj = body + " (No se verifica si usuario existe)";
            res.render("exito", { titulo: 'Cambio Clave', 
               msj: msj });
        }
        else {
            console.log("ERROR: " + body);
            res.render("error", { titulo: 'Cambio Clave', 
                error: body });
        }
    
    }
    else {
        res.render('error', { titulo: 'Cambio Clave', 
            error: 'Servidor "controleshls.azurewebsites.net" no disponible' });
    }
    });
  
  
});


 /* Android
 * ---------------
 */ 
app.get('/android', function(req, res){
    sess = req.session;
     if (sess.asesor){
      res.render('android', { title: 'Aplicación Android',
                            asesor: sess.asesor
          
      });
    }
    else {
    res.render('android', { title: 'Aplicación Android'});  
    }
});



/*
 * INICIO SERVIDOR
 * --------------------------
 
 
  var server=app.listen(8080,function(){
     console.log('Servidor web iniciado');
 });
*/


 /* Heroku
 
 */

    server=app.listen(port,function(){
    console.log('Servidor web iniciado');
});