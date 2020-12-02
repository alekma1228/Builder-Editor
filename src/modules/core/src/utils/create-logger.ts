export function pebCreateLogger(namespace: string): (...a: unknown[]) => undefined {
  const acceptableNss = [
    ...namespace
      .split(':')
      .map((el, i, all) =>
        [...all.slice(0, i), '*'].join(':'),
      ),
    namespace,
  ];

  if (globalThis.PEB_LOGS
    && globalThis.PEB_LOGS.split(',').find(
      eNs => acceptableNss.includes(eNs),
    )
  ) {
    const background = Math.abs(getHash(namespace)).toString(16)
      .padStart(6, '0')
      .slice(0, 6)
      .split('')
      .map(c => Number(Math.floor(parseInt(c, 16) / 1.25)).toString(16))
      .join('');

    return console.log.bind(
      console,
      `%c ${namespace} `, `background: #${background}; color: white; line-height: 2;`,
    );
  } else {
    return () => undefined
  }
}

function getHash(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr; // tslint:disable-line:no-bitwise
    hash |= 0; // tslint:disable-line:no-bitwise
  }
  return hash;
}
