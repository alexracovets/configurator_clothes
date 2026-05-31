class LogoFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LogoFileError';
  }
}

export { LogoFileError };
