export class ConflictError extends Error {
  public error
  public statusCode

  constructor(error) {
    super(error)

    error.name = ''
    this.name = error.toString()
    this.error = 'Conflict'
    this.statusCode = '409'
  }
}
