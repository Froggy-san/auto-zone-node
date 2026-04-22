import { Message } from "./types";

export interface TicketDetailStates {
  positionY: number;
  isDragging: boolean;
  selectedMessageId: number | null;
  isInternalOnly: boolean;
  isMounted: boolean;
  isHistory: boolean;
  focusedMessage: number | null;
  isMessagesOnly: boolean;
  isLoading: boolean;
  statusId: number | undefined;
  failedMessages: Message[];
}

export type PositionAction = {
  type: "position";
  payload: number;
};

export type IsDragingAction = {
  type: "is-dragging";
};

export type IsInternalOnlyAction = {
  type: "is-internal";
};

export type IsMessagesOnlyAction = {
  type: "is-messages";
};

export type IsLoadingAction = {
  type: "is-loading";
};
export type StatusIdAction = {
  type: "status-id";
  payload: number | undefined;
};

export type AddFailedMessages = {
  type: "add-failed-message";
  payload: Message;
};

export type ResetAction = {
  type: "reset";
};

export type Action =
  | { type: "position"; payload: number }
  | { type: "is-dragging"; payload: boolean }
  | { type: "is-mounted"; payload: boolean }
  | { type: "set-focused-message"; payload: number | null }
  | { type: "set-is-internal-only"; payload: boolean }
  | { type: "set-is-messages-only"; payload: boolean }
  | { type: "set-is-loading"; payload: boolean }
  | { type: "set-is-history"; payload: boolean }
  | { type: "set-selected-message-id"; payload: number | null }
  | { type: "set-status-id"; payload: number | undefined }
  | { type: "add-failed-message"; payload: Message }
  | { type: "remove-failed-message"; payload: Message }
  | { type: "reset" };
