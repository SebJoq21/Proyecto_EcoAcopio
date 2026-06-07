import { usuarioRepository } from '../repositories/usuario.repository';
import { comparePassword } from '../utils/bcrypt.util';
import { generateToken } from '../utils/jwt.util';

export class AuthService {
  async login(email: string, contrasenaPlana: string) {
    // 1. Buscamos al usuario por su correo
    const usuario = await usuarioRepository.findByEmail(email);
    
    if (!usuario) {
      throw new Error('Credenciales incorrectas.'); // Mensaje genérico por seguridad (no decimos qué falló)
    }

    // 2. Verificamos que no sea un ex-empleado desactivado
    if (!usuario.activo) {
      throw new Error('Esta cuenta ha sido desactivada. Contacte al administrador.');
    }

    // 3. Comparamos la contraseña plana con la encriptada en la BD
    const esValida = await comparePassword(contrasenaPlana, usuario.contrasena);
    
    if (!esValida) {
      throw new Error('Credenciales incorrectas.');
    }

    // 4. Creamos el "Gafete VIP" (Token JWT) con los datos clave del usuario
    const payload = {
      id_usuario: usuario.id_usuario,
      id_empresa: usuario.id_empresa,
      rol: usuario.rol
    };
    
    const token = generateToken(payload);

    // 5. Ocultamos la contraseña antes de devolver la respuesta
    const { contrasena, ...usuarioSinPassword } = usuario;

    // Retornamos el token y los datos del usuario logueado
    return {
      token,
      usuario: usuarioSinPassword
    };
  }
}

export const authService = new AuthService();