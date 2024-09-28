const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const { delay } = require('@whiskeysockets/baileys')

const mysql = require('mysql2');


/* // Crear una conexión con MySQL
const connection = mysql.createConnection({
    host: 'localhost',    // Cambia esto si tu base de datos no está en localhost
    user: 'root',    // Tu usuario de MySQL
    password: '',  // Tu contraseña de MySQL
    database: 'chatTerraza'  // Nombre de tu base de datos
});

// Conectarse a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
}); */


const welcome = [
    'Gracias por comunicarte con Terraza Barcelona',
    '',
    '¿Cómo podemos ayudarte?',
    '',
    '👉 Escribe *info* para ver información de la Terraza',
    '',
    '📲 [Más información](https://wa.me/523332395812?text=info)',
    '',
    '¿Tienes alguna otra consulta? por favor escríbela y te atenderemos pronto.',

];


const info = [
    '*TERRAZA BARCELONA*',
    'A continuación te mando toda la información...',
    '',
    'El *domicilio* es:',
    'QUINTANA ROO #29',
    'COL. MIGUEL HIDALGO',
    'ZAPOPAN, JAL',
    'C.P. 45196',
    '',
    'Aquí tienes la ubicación 👇'
]


const ubicacion = "https://maps.app.goo.gl/PY1zbreXHtSMSqrZ8";

const apartado = [
    '¡Conoce Terraza Barcelona! Puedes pasar en nuestros horarios disponibles, revisar la disponibilidad de fechas y apartarla por solo $1000. ¡Te esperamos!'
];

const flowOtro = addKeyword(EVENTS.ACTION)
    .addAnswer(['📌 Tu consulta será tomada en cuenta y nos pondremos en contacto contigo pronto.',
    ], { delay: 3000, capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!['menu'].includes(ctx.body)) {
            return fallBack('');
        }
        return gotoFlow(infoFlow)
    })

const flowDuda = addKeyword(EVENTS.ACTION)
    .addAnswer(['💬 Escribe tu duda y te atenderemos pronto.'
    ], { delay: 2000, capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!['menu'].includes(ctx.body)) {
            return gotoFlow(flowOtro)
        }
        return gotoFlow(infoFlow);
    })

const infoAll = addKeyword(EVENTS.ACTION)
    .addAnswer(info)
    .addAnswer(ubicacion, { media: 'https://i.imgur.com/hZC1K1b.png', delay: 3000 })
    .addAnswer('_Ofrecemos_', { media: "https://i.imgur.com/i3HreSp.jpeg", delay: 2000 })
    .addAnswer('_Horarios_', { media: "https://i.imgur.com/uIt2uIm.jpeg", delay: 2000 })
    .addAnswer('_Costos_', { media: "https://i.imgur.com/RH0Mf69.jpeg", delay: 2000 })
    .addAnswer(['Visita nuestra página en Facebook', 'https://www.facebook.com/TerrazzaBarcelona'], { delay: 2000 })
    .addAnswer(apartado, { delay: 2000 })
    .addAnswer(['¿Tienes alguna otra consulta? por favor escríbela y te atenderemos pronto.',
    ], { delay: 2000, capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!['menu'].includes(ctx.body)) {
            return fallBack('');
        }
    })


const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer(['Ya has solicitado información',
        '¿Tienes alguna otra consulta? por favor escríbela y te atenderemos pronto.'
    ], { delay: 2000, capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!['menu'].includes(ctx.body)) {
            return gotoFlow(flowOtro);
        }
    })


    let usuariosAtendidos = new Set();

    const palabrasClave = ['info', 'informacion', 'información', 'info', 'informes'];
    
    const infoFlow = addKeyword(EVENTS.WELCOME).addAnswer(
        welcome,
        { capture: true },
        async (ctx, { gotoFlow, fallBack }) => {
            // Convertir el cuerpo del mensaje a minúsculas para hacer la comparación insensible a mayúsculas
            const mensaje = ctx.body.toLowerCase();
    
            // Verificar si el mensaje contiene alguna de las palabras clave
            const contienePalabraClave = palabrasClave.some(palabra => mensaje.includes(palabra));
    
            if (!contienePalabraClave) {
                return fallBack(''); // No hacer nada si el mensaje no contiene las palabras clave
            } 
            
            // Si el usuario ya fue atendido, no hacer nada
            if (usuariosAtendidos.has(ctx.from)) {
                return fallBack(''); // No hacer nada si ya fue atendido
            }
    
            usuariosAtendidos.add(ctx.from);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de un pequeño retraso
            return gotoFlow(infoAll); // Redirigir al flujo de información
        }
    );
    


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([infoFlow, infoAll, flowConsultas, flowOtro, flowDuda])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
