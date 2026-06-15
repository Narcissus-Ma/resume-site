export interface ManagementSaveState {
  isDirty: boolean;
  isSaving: boolean;
}

export type ManagementSaveResult = 'success' | 'revision-conflict' | 'unauthorized' | 'error';

interface ManagementSaveAttempt {
  accepted: boolean;
  state: ManagementSaveState;
}

export const beginManagementSave = (state: ManagementSaveState): ManagementSaveAttempt =>
  state.isSaving
    ? { accepted: false, state }
    : { accepted: true, state: { ...state, isSaving: true } };

export const completeManagementSave = (
  state: ManagementSaveState,
  result: ManagementSaveResult,
): ManagementSaveState => ({
  isDirty: result === 'success' ? false : state.isDirty,
  isSaving: false,
});
