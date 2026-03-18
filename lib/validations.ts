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
 * Validador genérico seguidor del patrón de composición
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
      this.errors.push({ field: fieldName, message: 'Email inválido' })
    }
    return this
  }

  // Password validation
  password(value: unknown, fieldName = 'password', minLength = 6): this {
    if (!value) {
      this.errors.push({ field: fieldName, message: 'La contraseña es requerida' })
      return this
    }

    if (String(value).length < minLength) {
      this.errors.push({
        field: fieldName,
        message: `La contraseña debe tener al menos ${minLength} caracteres`,
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
      this.errors.push({ field: fieldName, message: `${fieldName} debe ser un número` })
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
 * Validaciones específicas del dominio
 */
export class DomainValidator {
  // Validar comanda
  static validateComanda(data: any): ValidationResult {
    const validator = new FormValidator()

    validator
      .required(data.categoriaId, 'categoriaId')
      .required(data.tipoConsumo, 'tipoConsumo')
      .custom(
        ['cliente', 'chica'].includes(data.tipoConsumo),
        'tipoConsumo',
        'Tipo de consumo inválido'
      )
      .required(data.medioPago, 'medioPago')
      .custom(
        ['efectivo', 'transferencia', 'debito', 'credito'].includes(data.medioPago),
        'medioPago',
        'Medio de pago inválido'
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

  // Validar categoría
  static validateCategoria(data: any): ValidationResult {
    const validator = new FormValidator()

    validator
      .string(data.nombre, 'nombre', 1, 255)
      .number(data.precioCliente, 'precioCliente', 0, 9999999)
      .number(data.precioChica, 'precioChica', 0, 9999999)
      .number(data.comisionChica, 'comisionChica', 0, 9999999)

    return validator.getResult()
  }

  // Validar chica
  static validateChica(data: any): ValidationResult {
    const validator = new FormValidator()

    validator.string(data.nombre, 'nombre', 1, 255)

    return validator.getResult()
  }

  // Validar configuración
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

    return validator.getResult()
  }
}
