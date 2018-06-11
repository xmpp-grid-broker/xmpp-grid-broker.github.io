import {ErrorLogService} from '.';

describe(ErrorLogService.name, () => {
  let errorLog: ErrorLogService;
  const message = 'some error message';


  beforeEach(() => {
    errorLog = new ErrorLogService();
  });

  it('should log error to error console', () => {
    spyOn(console, 'error');
    errorLog.error(message);
    expect(console.error).toHaveBeenCalledWith(message);
  });

  it('should log warning to warn console', () => {
    spyOn(console, 'warn');
    errorLog.warn(message);
    expect(console.warn).toHaveBeenCalledWith(message);
  });

  it('should log warning to warn console', () => {
    spyOn(console, 'info');
    errorLog.info(message);
    expect(console.info).toHaveBeenCalledWith(message);
  });

  it('should log "log" level to log console', () => {
    spyOn(console, 'log');
    errorLog.log(message);
    expect(console.log).toHaveBeenCalledWith(message);
  });

  it('should log debug to debug console', () => {
    spyOn(console, 'debug');
    errorLog.debug(message);
    expect(console.debug).toHaveBeenCalledWith(message);
  });
});
