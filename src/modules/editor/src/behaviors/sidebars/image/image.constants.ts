export const predefinedStyles = [
  {
    styles: {
      filterShadow: 'none',
    },
    form: {
      border: {
        enabled: false
      },
      shadow: {
        enabled: false,
        blur: 0,
        offset: 0,
        opacity: 0,
        angle: 0,
        color: '0, 0, 0',
      }
    },
  },
  {
    styles: {
      filterShadow: 'rgba(0,0,0,0.5) 0px 0px 5px 1px',
    },
    form: {
      shadow: {
        enabled: true,
        blur: 5,
        offset: 0,
        opacity: 50,
        angle: 0,
        color: '0,0,0',
      }
    },
  },
  {
    styles: {
      filterShadow: 'rgba(0,0,0,0.5) 0px -4px 5px 1px',
    },
    form: {
      shadow: {
        enabled: true,
        blur: 5,
        offset: 4,
        opacity: 50,
        angle: 90,
        color: '0,0,0',
      }
    }
  },
  {
    styles: {
      border: '2px solid #000000',
    },
    form: {
      border: {
        enabled: true,
        type: 'solid',
        color: '#000000',
        size: 2,
      }
    },
  },
  {
    styles: {
      border: '4px double #000000',
    },
    form: {
      border: {
        enabled: true,
        type: 'double',
        color: '',
        size: 4,
      }
    },
  },
  {
    styles: {
      filterShadow: 'rgba(0,0,0, 0.5) -4px -2px 0px 2px',
    },
    form: {
      shadow: {
        enabled: true,
        blur: 0,
        offset: 4,
        opacity: 100,
        angle: 145,
        color: '0,0,0',
      }
    },
  }
];
