import { ExecCommand } from '../text-editor.interface';
import { RGBToHex } from './utils.transform';

export const ColorTransform = {
  change: (doc: Document, value: string) => doc.execCommand(ExecCommand.ForeColor, false, value),
  get: (doc: Document) => RGBToHex(doc.queryCommandValue(ExecCommand.ForeColor)),
}
