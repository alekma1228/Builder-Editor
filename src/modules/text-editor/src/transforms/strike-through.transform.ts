import { ExecCommand } from '../text-editor.interface';

export const StrikeThroughTransform = {
  toggle: (doc: Document) => doc.execCommand(ExecCommand.StrikeThrough),
  get: (doc: Document) => doc.queryCommandState(ExecCommand.StrikeThrough),
}
