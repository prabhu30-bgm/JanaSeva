/**
 * Consistent API Success Response Builder
 */
class ApiResponse {
  /**
   * Builds standard success response
   * @param {*} data - Payload
   * @param {string|null} message - Optional human-readable message
   * @param {object|null} meta - Optional pagination/metadata
   */
  static success(data = null, message = null, meta = null) {
    const payload = { success: true };
    if (message !== null && message !== undefined) {
      payload.message = message;
    }
    if (data !== null && data !== undefined) {
      payload.data = data;
    }
    if (meta !== null && meta !== undefined) {
      payload.meta = meta;
    }
    return payload;
  }
}

module.exports = ApiResponse;
