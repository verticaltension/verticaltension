export class SocialAdapterError extends Error {
  constructor(
    message,
    {
      classification = "error",
      httpStatus = null,
      code = "",
      permanent = false,
      responseExcerpt = "",
    } = {}
  ) {
    super(message);
    this.name = "SocialAdapterError";
    this.classification = classification;
    this.httpStatus = httpStatus;
    this.code = code;
    this.permanent = permanent;
    this.responseExcerpt = responseExcerpt;
  }
}
