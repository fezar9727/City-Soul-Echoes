require('dotenv').config();
const mongoose = require('mongoose');
const Biografia = require('../models/Biografia');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    await Biografia.deleteMany({});
    await Biografia.create({
        nombreCompleto: 'Oscar Fernando Salazar Toro',
        edad: 28,
        parrafos: [
            { orden: 1, texto: 'Mi nombre es Oscar Fernando Salazar Toro. Tengo 28 años, y mi vida ha sido un viaje constante de transformación a través de la geografía colombiana.' },
            { orden: 2, texto: 'Originario de Ipiales, Nariño, crecí en el corregimiento de José María Hernández, rodeado del color y la música de los Carnavales de Negros y Blancos. Desde pequeño el arte formó parte de mí: lo que empezó con dibujos y figuras de plastilina evolucionó hacia la escultura en porcelanicrón y arcilla.' },
            { orden: 3, texto: 'Graduado de la Institución Educativa Los Héroes (Promoción 2015), recorrí ciudades como Bogotá, Medellín y Pereira hasta llegar a Cali hace cinco años, donde hoy considero mi hogar. Aquí me desempeñé como auxiliar de cocina, aprendiendo disciplina y precisión en la comida rápida, el ramen, el sushi y los asados.' },
            { orden: 4, texto: 'Actualmente soy estudiante de Tecnología en Análisis y Desarrollo de Software, y participo en un bootcamp intensivo enfocado en tecnologías modernas.' },
            { orden: 5, texto: 'City Soul Echoes nace precisamente de esa convergencia: mis raíces artísticas, la disciplina forjada en la cocina, y mi pasión por construir herramientas digitales que impulsen el arte, el emprendimiento consciente y el bienestar en la comunidad.' }
        ]
    });
    console.log('Biografía cargada correctamente.');
    await mongoose.disconnect();
}

main();