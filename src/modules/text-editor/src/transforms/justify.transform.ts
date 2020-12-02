import { ExecCommand, TextJustify } from '../text-editor.interface';

export const JustifyTransform = {
  change: (doc: Document, value: TextJustify) => {
    switch (value) {
      case TextJustify.Left:
        doc.execCommand(ExecCommand.JustifyLeft);
        break;
      case TextJustify.Center:
        doc.execCommand(ExecCommand.JustifyCenter);
        break;
      case TextJustify.Right:
        doc.execCommand(ExecCommand.JustifyRight);
        break;
      case TextJustify.Full:
        doc.execCommand(ExecCommand.JustifyFull);
        break;
    }
  },
  get: (doc: Document) => {
    if (doc.queryCommandState(ExecCommand.JustifyLeft)) {
      return TextJustify.Left;
    } else if (doc.queryCommandState(ExecCommand.JustifyCenter)) {
      return TextJustify.Center;
    } else if (doc.queryCommandState(ExecCommand.JustifyRight)) {
      return TextJustify.Right;
    } else if (doc.queryCommandState(ExecCommand.JustifyFull)) {
      return TextJustify.Full;
    } else {
      return null;
    }
  },
}
