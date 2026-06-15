import assert from 'node:assert/strict';
import test from 'node:test';

import {
  beginManagementSave,
  completeManagementSave,
  type ManagementSaveState,
} from '../src/domain/admin/management-state.ts';

const dirtyState: ManagementSaveState = {
  isDirty: true,
  isSaving: false,
};

test('revision 冲突后保留未保存状态', () => {
  const saving = beginManagementSave(dirtyState);
  assert.equal(saving.accepted, true);
  assert.deepEqual(completeManagementSave(saving.state, 'revision-conflict'), dirtyState);
});

test('认证失效不会被标记为保存成功', () => {
  const saving = beginManagementSave(dirtyState);
  assert.deepEqual(completeManagementSave(saving.state, 'unauthorized'), dirtyState);
});

test('保存过程中拒绝重复提交', () => {
  const saving = beginManagementSave(dirtyState);
  assert.equal(beginManagementSave(saving.state).accepted, false);
});

test('只有保存成功才清除未保存状态', () => {
  const saving = beginManagementSave(dirtyState);
  assert.deepEqual(completeManagementSave(saving.state, 'success'), {
    isDirty: false,
    isSaving: false,
  });
});
