let codes = require('../config').codes;
/**
 * 业务异常类
 */
class BusinessError extends Error {
  /**
   * 实例
   * @param {Number} code 
   * @param {String} message 
   */
  constructor(code, message) {
    super(message);
    this.code = code;
  }
  toJsonString() {
    return JSON.stringify({ code: this.code, message: this.message });
  }
  static create(typeCode) {
    return new BusinessError(typeCode[0], typeCode[1]);
  }
  static getCode(name) {
    return codes[name];
  }
  static custom(errorCode, errorMessage) {
    return new BusinessError(errorCode, errorMessage);
  }
}
module.exports = BusinessError;