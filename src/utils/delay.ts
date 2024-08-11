export function delay(time = 1500) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
