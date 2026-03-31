// Validaciones reutilizables para formularios

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validador generico seguidor del patron de composicion
 */
export class FormValidator {
  private errors: ValidationError[] = []

  constructor() {
    this.errors = []
  }

  // Email validation
  email(value: unknown, fieldName = 'email'): this {
    if (!value) {
      this.errors.push({ field: fieldName, message: 'El email es requerido' })
      return this
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(value))) {
      this.errors.push({ field: fieldName, message: 'Email invalido' })
    }
    return this
  }

  // Password validation
  password(value: unknown, fieldName = 'password', minLength = 6): this {
    if (!value) {
      this.errors.push({ field: fieldName, message: 'La contrasena es requerida' })
      return this
    }

    if (String(value).length < minLength) {
      this.errors.push({
        field: fieldName,
        message: `La contrasena debe tener al menos ${minLength} caracteres`,
      })
    }
    return this
  }

  // String validation
  string(value: unknown, fieldName: string, minLength = 1, maxLength = 255): this {
    if (!value) {
      this.errors.push({ field: fieldName, message: `${fieldName} es requerido` })
      return this
    }

    const strValue = String(value)
    if (strValue.length < minLength) {
      this.errors.push({
        field: fieldName,
        message: `${fieldName} debe tener al menos ${minLength} caracteres`,
      })
    }
    if (strValue.length > maxLength) {
      this.errors.push({
        field: fieldName,
        message: `${fieldName} no puede exceder ${maxLength} caracteres`,
      })
    }
    return this
  }

  // Number validation
  number(value: unknown, fieldName: string, min?: number, max?: number): this {
    if (value === null || value === undefined || value === '') {
      this.errors.push({ field: fieldName, message: `${fieldName} es requerido` })
      return this
    }

    const numValue = Number(value)
    if (isNaN(numValue)) {
      this.errors.push({ field: fieldName, message: `${fieldName} debe ser un numero` })
      return this
    }

    if (min !== undefined && numValue < min) {
      this.errors.push({
        field: fieldName,
        message: `${fieldName} debe ser mayor o igual a ${min}`,
      })
    }

    if (max !== undefined && numValue > max) {
      this.errors.push({
        field: fieldName,
        message: `${fieldName} debe ser menor o igual a ${max}`,
      })
    }

    return this
  }

  // Required field
  required(value: unknown, fieldName: string): this {
    if (!value) {
      this.errors.push({ field: fieldName, message: `${fieldName} es requerido` })
    }
    return this
  }

  // Custom validation
  custom(isValid: boolean, fieldName: string, message: string): this {
    if (!isValid) {
      this.errors.push({ field: fieldName, message })
    }
    return this
  }

  // Get validation result
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
    }
  }

  // Get error by field
  getFieldErrors(fieldName: string): ValidationError[] {
    return this.errors.filter((e) => e.field === fieldName)
  }

  // Get first error for field
  getFieldError(fieldName: string): string | null {
    const errors = this.getFieldErrors(fieldName)
    return errors.length > 0 ? errors[0].message : null
  }
}

/**
 * Validaciones especificas del dominio
 */
interface ComandaData {
  categoriaId?: unknown
  tipoConsumo?: unknown
  medioPago?: unknown
  precioBase?: unknown
  chica1Id?: unknown
}

interface CategoriaData {
  nombre?: unknown
  tipo?: unknown
  precioCliente?: unknown
  precioChica?: unknown
  comisionChica?: unknown
}

interface ChicaData {
  nombre?: unknown
}

export class DomainValidator {
  // Validar comanda
  static validateComanda(data: ComandaData): ValidationResult {
    const validator = new FormValidator()

    validator
      .required(data.categoriaId, 'categoriaId')
      .required(data.tipoConsumo, 'tipoConsumo')
      .custom(
        ['cliente', 'chica'].includes(String(data.tipoConsumo ?? '')),
        'tipoConsumo',
        'Tipo de consumo invalido'
      )
      .required(data.medioPago, 'medioPago')
      .custom(
        ['efectivo', 'transferencia', 'debito', 'credito'].includes(String(data.medioPago ?? '')),
        'medioPago',
        'Medio de pago invalido'
      )
      .number(
        data.precioBase,
        'precioBase',
        1,
        9999999
      )

    // Si es chica, necesita al menos una chica
    if (data.tipoConsumo === 'chica') {
      validator.required(data.chica1Id, 'chica1Id')
    }

    return validator.getResult()
  }

  // Validar categoria
  static validateCategoria(data: CategoriaData): ValidationResult {
    const validator = new FormValidator()

    validator
      .string(data.nombre, 'nombre', 1, 255)

    if (data.tipo !== 'botella') {
      validator
        .number(data.precioCliente, 'precioCliente', 0, 9999999)
        .number(data.precioChica, 'precioChica', 0, 9999999)
        .number(data.comisionChica, 'comisionChica', 0, 9999999)
    }

    return validator.getResult()
  }

  // Validar chica
  static validateChica(data: ChicaData): ValidationResult {
    const validator = new FormValidator()

    validator.string(data.nombre, 'nombre', 1, 255)

    return validator.getResult()
  }

  // Validar configuracion
  static validateConfig(data: any): ValidationResult {
    const validator = new FormValidator()

    if (data.maxChicasBottella !== undefined) {
      validator.number(data.maxChicasBottella, 'maxChicasBottella', 1, 10)
    }

    if (data.porcBottella100k !== undefined) {
      validator.number(data.porcBottella100k, 'porcBottella100k', 0, 1)
    }

    if (data.porcBottella150kMas !== undefined) {
      validator.number(data.porcBottella150kMas, 'porcBottella150kMas', 0, 1)
    }

    if (data.minValor150k !== undefined) {
      validator.number(data.minValor150k, 'minValor150k', 1, 9999999)
    }

    if (data.comisionAcompananteBotella !== undefined) {
      validator.number(data.comisionAcompananteBotella, 'comisionAcompananteBotella', 0, 9999999)
    }

    return validator.getResult()
  }
}
