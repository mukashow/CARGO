import s from '../index.module.scss';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Box, CardInformation, ErrorBoundaryHoc, FormCard, Header, Tabs } from '@components';
import { ReceiptCreate } from './components';

export const CashReceiptOrderDetail = ErrorBoundaryHoc(() => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [commentRowCount, setCommentRowCount] = useState(null);
  const { t } = useTranslation();
  const relativeCard = useRef();
  const parentCard = useRef();
  const commentRef = useRef();

  const data = useMemo(() => {
    return [
      { title: `${t('assignment').toLowerCase()}:`, value: 'DRAFT' },
      { title: `${t('clientCodeClient')}:`, value: 'DRAFT' },
      { title: `${t('clientFullName')}:`, value: 'DRAFT' },
      { title: `${t('invoice').toLowerCase()} #555:`, value: 'DRAFT', spaceBetween: true },
      { title: `${t('sumForPayment').toLowerCase()}:`, value: 'DRAFT', spaceBetween: true },
    ];
  }, []);

  const onCommentRef = el => {
    commentRef.current = el;
    if (!el) return;
    if (el.scrollHeight > el.clientHeight) {
      setShowToggle(true);
    }
  };

  useLayoutEffect(() => {
    if (
      parentCard.current.clientHeight - commentRef.current.clientHeight >
      relativeCard.current.clientHeight
    ) {
      setCommentRowCount(3);
    } else {
      const expectedCommentHeight =
        commentRef.current.clientHeight -
        (parentCard.current.clientHeight - relativeCard.current.clientHeight);
      setCommentRowCount(Math.floor(expectedCommentHeight / 18.2));
    }
  }, []);

  return (
    <>
      <Header
        title={t('cashReceiptOrder') + ' #555'}
        status="status"
        statusAuthor="author"
        statusDate="01.01.2023"
      />
      <Box className={s.detailRoot}>
        <div
          className={s.cards}
          style={{ alignItems: commentRowCount !== null ? 'unset' : 'start' }}
        >
          <FormCard cardTitle={t('toBillPayment')} ref={parentCard}>
            <CardInformation information={data} />
            <div className={s.commentPart}>
              <p className={s.title}>{t('comments').toLowerCase()}:</p>
              <p
                className={clsx(s.comment, !commentOpen && s.closed)}
                style={{ '--rows--': commentRowCount }}
                ref={onCommentRef}
              >
                Вот пример статьи на 1000 символов. Это достаточно маленький текст, оптимально
                подходящий для карточек товаров в интернет-магазинах или для небольших
                информационных публикаций. В таком тексте редко бывает более 2-3 абзацев и обычно
                один подзаголовок. Но можно и без него. На 1000 символов рекомендовано использовать
                1-2 ключа и одну картину. на 1000 символов – это сколько примерно слов? Статистика
                Word показывает, что «тысяча» включает в себя 150-200 слов средней величины. Но,
                если злоупотр Вот пример статьи на 1000 символов. Это достаточно маленький текст,
                оптимально подходящий для карточек товаров в интернет-магазинах или для небольших
                информационных публикаций. В таком тексте редко бывает более 2-3 абзацев и обычно
                один подзаголовок. Но можно и без него. На 1000 символов рекомендовано использовать
                1-2 ключа и одну картину. на 1000 символов – это сколько примерно слов? Статистика
                Word показывает, что «тысяча» включает в себя 150-200 слов средней величины. Но,
                если злоупотр
              </p>
              {showToggle && (
                <span className={s.toggle} onClick={() => setCommentOpen(!commentOpen)}>
                  {t(commentOpen ? 'shrink' : 'readMore')}
                </span>
              )}
            </div>
          </FormCard>
          <FormCard cardTitle={t('accepted')} ref={relativeCard}>
            <ReceiptCreate />
            {/*<Receipt />*/}
          </FormCard>
        </div>
        <Tabs tabs={[{ title: t('tableDoc'), buttonTitle: 'addDocument' }]} />
      </Box>
    </>
  );
});
