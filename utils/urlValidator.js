class URLValidator {
  static isValid(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = URLValidator;