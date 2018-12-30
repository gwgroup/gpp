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
}
module.exports = BusinessError;