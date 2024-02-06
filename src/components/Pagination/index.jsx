import s from './index.module.scss';
import { useTranslation } from 'react-i18next';
import PaginationPlugin from 'react-js-pagination';
import { useSearchParams } from 'react-router-dom';
import { ErrorBoundaryHoc } from '@components';

export const Pagination = ErrorBoundaryHoc(({ current_page, results_count, onChange }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const setPage = value => {
    searchParams.set('page', value);
    setSearchParams(searchParams);
  };

  return (
    <PaginationPlugin
      innerClass={s.list}
      itemClass={s.listLi}
      linkClass={s.listLink}
      activeLinkClass={s.listLinkActive}
      prevPageText={t('paginationPrev')}
      nextPageText={t('paginationNext')}
      hideFirstLastPages
      activePage={Number(current_page)}
      itemsCountPerPage={Number(searchParams.get('page_size'))}
      totalItemsCount={results_count}
      pageRangeDisplayed={5}
      disabledClass={s.disabled}
      onChange={value => {
        if (onChange) {
          return onChange(() => setPage(value));
        }
        setPage(value);
      }}
    />
  );
});
