import s from './icon-page.module.scss';
import { Box, Icon } from '@/components';

export const IconPage = () => {
  const array = [
    'comment',
    'menuList',
    'menu',
    'logo',
    'chevron-right',
    'user',
    'dotsThreeCircle',
    'select',
    'arrowsDownUp',
    'cleaner',
    'alert',
    'home',
    'sklads',
    'send',
    'containers',
    'wallet',
    'file',
    'users',
    'plusCircle',
    'arrowRight',
    'setting',
    'exit',
    'calendar',
    'edit',
    'arrowDown',
    'trash',
    'cross',
    'attach',
    'preview',
    'share',
    'download',
    'printer',
    'comments',
    'bell-alerts',
    'arrow-right-thin',
    'sending',
    'time',
    'cargo',
    'bell',
    'access',
    'alert-circle',
    'minus-square',
    'dollar',
    'arrow-up',
    'archive',
    'access-square',
    'indicator',
    'word-document',
    'history',
    'arrow-down-thin',
    'plus-square',
    'search',
    'toggle-right',
    'trash-2',
    'phone-2',
    'zoom-in',
    'zoom-out',
    'mail',
    'download-2',
    'globus',
    'headphones',
    'help-circle',
    'home-2',
    'image',
    'info',
    'key',
    'layout',
    'link',
    'location',
    'map-pin',
    'maximize-2',
    'minimize-2',
    'zip-file',
    'file-2',
    'arrowRigth',
    'box',
    'open-box',
  ];
  return (
    <Box>
      <div className={s.grid}>
        {array.map(item => (
          <div className={s.card} key={item}>
            <Icon iconId={item} />
            <div className={s.title}>{item}</div>
          </div>
        ))}
      </div>
    </Box>
  );
};
