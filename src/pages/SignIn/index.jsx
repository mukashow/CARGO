import React, { useEffect, useRef, useState } from 'react';
import s from './index.module.scss';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components';
import { ErrorBoundaryHoc } from '@components/ErrorBoundary';
import { signIn } from '@/store/actions';
import { useOutsideClick, useYupValidationResolver } from '@/hooks';

export const SignIn = ErrorBoundaryHoc(() => {
  const [language, setLanguage] = useState(checkLanguage());
  const [error, setError] = useState('');
  const [isLangVisible, setIsLangVisible] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const langRef = useRef(null);
  useOutsideClick(langRef, () => setIsLangVisible(false));

  const resolver = useYupValidationResolver(
    yup.object().shape({
      username: yup.string().required('* Обязательное поле'),
      password: yup.string(),
    })
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver,
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function checkLanguage() {
    const language = localStorage.getItem('i18nextLng');
    if (language.match(/ru|ru-RU/)) return 'Русский';
    if (language.match(/en|en-US/)) return 'English';
    return '中文';
  }

  const submitForm = formData => {
    dispatch(signIn({ formData, navigate, t })).unwrap().catch(setError);
  };

  const changeLanguage = (value, translate) => {
    localStorage.setItem('i18nextLng', value);
    setIsLangVisible(false);
    setLanguage(translate);
    i18n.changeLanguage(value);
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }, [error]);

  useEffect(() => {
    navigate('/');
  }, []);

  return (
    <div className={s.root}>
      <div>
        <img src="/images/Truck-Map.png" alt="" />
      </div>
      <div className={s.wrapper}>
        <div className={s.wrapperContent}>
          <div className={s.head}>
            <div className={s.title}>{t('enter')}</div>
            <div className={s.wrapperLanguage} ref={langRef}>
              <div
                className={s.wrapperLanguageValue}
                onClick={() => setIsLangVisible(!isLangVisible)}
              >
                {language}
                <Icon iconClass={s.wrapperLanguageIcon} iconId="chevron-right" />
              </div>
              {isLangVisible && (
                <div className={s.wrapperLanguageDropdown}>
                  <div
                    className={s.wrapperLanguageDropdownItem}
                    onClick={() => changeLanguage('ru', 'Русский')}
                  >
                    Русский
                  </div>
                  <div
                    className={s.wrapperLanguageDropdownItem}
                    onClick={() => changeLanguage('en', 'English')}
                  >
                    English
                  </div>
                  <div
                    className={s.wrapperLanguageDropdownItem}
                    onClick={() => changeLanguage('zhHans', '中文')}
                  >
                    中文
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={s.box}>
            <form action="" className={s.form} onSubmit={handleSubmit(submitForm)}>
              <div className={s.control}>
                <label className={s.label}>{t('loginInput')}</label>
                <input
                  type="text"
                  className={`${s.input} ${errors?.username?.message ? s.inputError : ''}`}
                  {...register(`username`)}
                />
                {errors?.username?.message && (
                  <div className={`${s.inputErrorMessage} regular-12`}>
                    {errors.username.message}
                  </div>
                )}
              </div>
              <div className={s.control}>
                <label className={s.label}>{t('passwordInput')}</label>
                <input
                  type="password"
                  className={`${s.input} ${errors?.password?.message ? s.inputError : ''}`}
                  {...register(`password`)}
                />
                {errors?.password?.message && (
                  <div className={`${s.inputErrorMessage} regular-12`}>
                    {errors.password.message}
                  </div>
                )}
              </div>
              {error && typeof error === 'string' && <div className={s.errorMessage}>{error}</div>}
              <button className={s.button}>{t('buttonSubmit')}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});
