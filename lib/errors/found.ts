
export class FoundError extends Error {
  public error
  public statusCode

  constructor(error) {
    super(error)

    error.name = ''
    this.name = error.toString()
    this.error = 'Not Found'
    this.statusCode = '404'
  }
}
