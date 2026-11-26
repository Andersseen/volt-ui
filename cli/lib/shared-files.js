// Files living directly in packages/volt/src/lib (not under components/ or layouts/) that some
// components import via a relative path, e.g. `from '../../utils'`. The CLI copies them flat into
// the target dir (sibling to each component's own subfolder), since that is what the rewritten
// `../utils` import path expects. Shared by the CLI (lib/core.js) and the manifest generator, which
// follows these imports to find the npm packages a copy needs.
const SHARED_LIB_FILES = [
  'utils.ts',
  'form-control-state.ts',
  'host-forwarding.ts',
  'aria-invalid.ts',
  'volt-ids.ts',
  'mirror-value.ts',
  'roving-focus.ts',
  'quartz-ids.ts',
  'quartz-attributes.ts',
];

module.exports = { SHARED_LIB_FILES };
