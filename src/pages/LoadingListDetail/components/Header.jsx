import React, { useMemo } from 'react';
import s from '@components/Header/index.module.scss';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button, Header as AppHeader } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';

export const Header = ErrorBoundaryHoc(
  ({
    availableStatuses,
    canReturnForRevision,
    setReturnForRevisionModal,
    setConfirmModal,
    setConfiscatedCargoModal,
  }) => {
    const { loadingList, scannedPlaces, unloadingGoods } = useSelector(state => ({
      loadingList: state.loadingList.loadingListDetail,
      scannedPlaces: state.loadingList.scannedPlaces,
      unloadingGoods: state.loadingList.unloadingGoods,
    }));
    const roleId = useSelector(state => state.auth.user.role_id);
    const { t, i18n } = useTranslation();
    const { loadingListId } = useParams();

    const [headerSubmitValue, headerSubmit, submitBtnProps] = useMemo(() => {
      if (!availableStatuses) return [null, null, null];
      const {
        isWaitingForManagerConfirm,
        isWaitingForBrokerConfirm,
        awaitingPermissionToLoad,
        waitingToLoad,
        onWay,
        confirmArrival,
        confirmArrivalToWarehouse,
        onUnloading,
        finished,
      } = availableStatuses;

      if (roleId === 5) {
        if (loadingList?.status === 1) {
          if (isWaitingForBrokerConfirm) {
            return [
              t('sendForCheck'),
              () => setConfirmModal({ title: t('toSendLoadingListToBroker'), isOpen: true }),
            ];
          }

          if (awaitingPermissionToLoad) {
            return [
              t('sendToLoad'),
              () => setConfirmModal({ title: t('toSendLoadingListForLoad'), isOpen: true }),
            ];
          }
        }

        if (loadingList?.status === 2 && (isWaitingForBrokerConfirm || awaitingPermissionToLoad)) {
          return [
            t('modalConfirmLabelConfirm'),
            () => setConfirmModal({ title: t('toConfirmLoadingList'), isOpen: true }),
          ];
        }
      }

      if (roleId === 4 && awaitingPermissionToLoad) {
        return [
          t('modalConfirmLabelConfirm'),
          () => setConfirmModal({ title: t('toConfirmLoadingList'), isOpen: true }),
        ];
      }

      if (confirmArrival) {
        const message = i18n.language.match(/ru-RU|ru/)
          ? `Подтвердить прибытие погрузочного листа ${loadingListId} на вашу точку?`
          : i18n.language.match(/en-US|en/)
          ? `Confirm the arrival of loading list ${loadingListId} at your location?`
          : `确认装载清单${loadingListId}到达您的位置？`;

        return [t('confirmArrival'), () => setConfirmModal({ title: message, isOpen: true })];
      }

      if (confirmArrivalToWarehouse) {
        const message = i18n.language.match(/ru-RU|ru/)
          ? `Подтвердить прибытие погрузочного листа ${loadingListId} на склад склада и отправить его на разгрузку?`
          : i18n.language.match(/en-US|en/)
          ? `Confirm the arrival of the loading list ${loadingListId} at the warehouse and send it for unloading?`
          : `确认装货单$${loadingListId}到达仓库并送去卸货？`;

        return [t('confirmArrival'), () => setConfirmModal({ title: message, isOpen: true })];
      }

      if (roleId === 2 && waitingToLoad) {
        return [
          t('startLoading'),
          () => setConfirmModal({ title: t('toStartLoading'), isOpen: true }),
        ];
      }

      if (roleId === 1) {
        let submitFunc = text => setConfirmModal({ title: t(text), isOpen: true });

        if (!loadingList?.goods_list.length) {
          submitFunc = () => toast.warn(t('addCargoPlease'));
        }

        if (isWaitingForManagerConfirm) {
          return [t('sendForCheck'), () => submitFunc('toSendLoadingListToCheck')];
        }
        if (waitingToLoad) {
          return [t('allowLoading'), () => submitFunc('toAllowLoadingOnLoadingList')];
        }
        if (onWay) {
          const text = i18n.language.match(/ru|ru-RU/)
            ? `Подтвердить отправку погрузочного листа ${loadingListId} со склада?`
            : i18n.language.match(/en|en-US/)
            ? `Confirm the shipment of loading list ${loadingListId} from the warehouse?`
            : `确认从仓库发货的装载清单${loadingListId}？`;
          return [t('confirmSending'), () => submitFunc(text)];
        }
      }

      if (availableStatuses?.onLoading) {
        return [
          t('startLoading'),
          () => setConfirmModal({ title: t('toStartLoading'), isOpen: true }),
          { isOrange: true },
        ];
      }

      if (availableStatuses?.waitingToSend) {
        const leftNotScanned =
          scannedPlaces?.total.scanned_place_count < scannedPlaces?.total.place_count;

        return [
          t('complete'),
          () =>
            setConfirmModal({
              ...(leftNotScanned
                ? {
                    title: t('toFinishLoading'),
                    description: t('toFinishLoadingDescription'),
                  }
                : {
                    title: t('toFinishLoading'),
                  }),
              isOpen: true,
            }),
        ];
      }

      if (onUnloading) {
        return [
          t('startUnloading'),
          () => setConfirmModal({ title: `${t('startUnloading')}?`, isOpen: true }),
        ];
      }

      if (finished) {
        if (loadingList?.status === 13) {
          return [
            t('confirmUnloading'),
            () =>
              setConfirmModal({
                title: t('toConfirmUnloadingLoadingList', { number: loadingList?.id }),
                description: t(
                  loadingList?.has_lost_places
                    ? 'toConfirmUnloadingLoadingListLostDescription'
                    : 'toConfirmUnloadingLoadingListDescription'
                ),
                isOpen: true,
              }),
          ];
        } else {
          const leftNotScanned =
            unloadingGoods?.total.scanned_place_count < unloadingGoods?.total.place_count;
          return [
            t('complete'),
            () =>
              setConfirmModal({
                ...(leftNotScanned
                  ? { title: t('toFinishLoadingDescription') }
                  : { title: t('toCompleteUnloading') }),
                isOpen: true,
              }),
          ];
        }
      }

      return [null, null, null];
    }, [loadingList, availableStatuses, scannedPlaces, unloadingGoods]);

    const [additionalBtnValue, additionalBtnClick, additionalBtnProps] = useMemo(() => {
      if ((roleId === 5 || roleId === 4) && canReturnForRevision) {
        return [t('returnForRevision'), () => setReturnForRevisionModal(true), { red: true }];
      }
      if (availableStatuses?.onWay && loadingList?.status === 10) {
        const message = i18n.language.match(/ru-RU|ru/)
          ? `Подтвердить выезд погрузочного листа ${loadingListId} с вашей точки?`
          : i18n.language.match(/en-US|en/)
          ? `Confirm the departure of loading list ${loadingListId} from your point?`
          : `确认装载清单${loadingListId}离开你的观点？`;
        return [
          t('confirmDeparture'),
          () => setConfirmModal({ title: message, isOpen: true }),
          { isOrange: true },
        ];
      }
      return [null, null, null];
    }, [canReturnForRevision, availableStatuses, loadingList]);

    return (
      <AppHeader
        title={`${t('loadingList')} #${loadingListId}`}
        status={loadingList?.status_name}
        statusId={loadingList?.status}
        statusType="loadingList"
        statusDate={loadingList?.created_at.slice(0, 10)}
        statusAuthor={`${loadingList?.creator_name} ${loadingList?.creator_last_name}`}
        onClick={headerSubmit}
        submitButtonValue={headerSubmitValue}
        submitButtonProps={submitBtnProps}
        onAdditionalClick={additionalBtnClick}
        additionalSubmitButtonValue={additionalBtnValue}
        additionalSubmitButtonProps={additionalBtnProps}
        Buttons={
          loadingList?.can_mark_confiscated_place && (
            <Button
              value={t('markConfiscatedPlace')}
              onClick={() => setConfiscatedCargoModal(true)}
              isBlue
              className={s.button}
              red
            />
          )
        }
      />
    );
  }
);
