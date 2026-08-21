const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const perfilArtistaSchema = new mongoose.Schema({
    nombreArtistico: { type: String, trim: true, required: true },
    bio: { type: String, maxlength: [600, 'La bio no puede superar los 600 caracteres'], default: '' },
    disciplinas: {
        type: [String],
        enum: { values: ['pintura', 'escultura', 'musica', 'digital', 'fotografia', 'otro'], message: '{VALUE} no es una disciplina válida' },
        default: []
    },
    metodoContacto: {
        type: String,
        enum: {
            values: ['correo', 'instagram', 'facebook', 'whatsapp'],
            message: '{VALUE} no es un método de contacto válido'
        },
        default: 'correo'
    },
    redes: {
        instagram: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        facebook: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
        portafolioExterno: { type: String, default: '' }
    },
    datosPago: {
        nequi: { type: String, default: '' },
        llavePublicaWompi: { type: String, default: '' }
    }
}, { _id: false });
const perfilDocenteSchema = new mongoose.Schema({
    nombrePublico: { type: String, trim: true, required: true },
    especialidad: { type: String, required: true, trim: true },
    bio: { type: String, maxlength: [600, 'La bio no puede superar los 600 caracteres'], default: '' },
    experiencia: { type: String, default: '' },
    modalidad: {
        type: String,
        enum: { values: ['virtual', 'presencial', 'mixta'], message: '{VALUE} no es una modalidad válida' },
        default: 'virtual'
    },
    metodoContacto: {
        type: String,
        enum: {
            values: ['correo', 'instagram', 'facebook', 'whatsapp'],
            message: '{VALUE} no es un método de contacto válido'
        },
        default: 'correo'
    },
    redes: {
        instagram: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        facebook: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
        portafolioExterno: { type: String, default: '' }
    },
    datosPago: {
        nequi: { type: String, default: '' },
        llavePublicaWompi: { type: String, default: '' }
    }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: [true, 'El nombre completo es obligatorio'], trim: true },
    correo: { type: String, required: [true, 'El correo es obligatorio'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'La contraseña es obligatoria'], minlength: [8, 'La contraseña debe tener al menos 8 caracteres'], select: false },
    telefono: { type: String, default: '' },
    ciudad: { type: String, default: 'Cali' },
    bio: { type: String, maxlength: [300, 'La biografía no puede superar los 300 caracteres'], default: '' },
    avatarUrl: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' },
    rol: {
        type: String,
        enum: { values: ['usuario', 'artista', 'docente', 'admin'], message: '{VALUE} no es un rol válido' },
        default: 'usuario'
    },
    activo: { type: Boolean, default: true },
    perfilArtista: perfilArtistaSchema,
    perfilDocente: perfilDocenteSchema,
    correoVerificado: { type: Boolean, default: false },
    puedeVender: { type: Boolean, default: false },
    verificacionToken: { type: String },
    verificacionExpira: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpira: { type: Date },
}, { timestamps: true });

usuarioSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
    return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);