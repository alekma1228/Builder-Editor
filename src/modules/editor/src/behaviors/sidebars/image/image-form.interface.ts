export interface ImageForm {
  style: {
    image: {
      source: string,
    },
    border: {
      enabled: boolean,
      type: { name: any },
      color: string,
      size: number,
    },
    shadow: {
      enabled: boolean,
      blur: number,
      offset: number,
      opacity: number,
      angle: number,
      color: string,
    },
    opacity: number,
  };
  arrange: {
    size: {
      width: number,
      height: number,
      constrainProportions: boolean,
    },
    position: {
      posX: number,
      posY: number,
    },
    angle: number;
    scaleX: 1 | -1;
    scaleY: 1 | -1;
  };
}

export interface StyleForm {
    image: {
      source: string,
    },
    border: {
      enabled: boolean,
      type: { name: any },
      color: string,
      size: number,
    },
    shadow: {
      enabled: boolean,
      blur: number,
      offset: number,
      opacity: number,
      angle: number,
      color: string,
    },
    opacity: number,
}