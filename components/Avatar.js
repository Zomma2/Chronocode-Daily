import React, { useMemo } from 'react';
import NiceAvatar, { genConfig } from 'react-nice-avatar';

function Avatar({ visible = true, username = 'user', avatarConfig = null }) {
  // Use provided config, or generate from username
  const config = useMemo(() => {
    if (avatarConfig) {
      return avatarConfig;
    }
    return genConfig(username || 'default-user');
  }, [avatarConfig, username]);

  if (!visible) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <NiceAvatar
          id={`avatar-${username || 'default-user'}`}
          className="w-32 h-32"
          shape="circle"
          {...config}
        />
      </div>
      <p className="text-xs text-zinc-500 capitalize truncate">{username}</p>
    </div>
  );
}

export default React.memo(Avatar);
