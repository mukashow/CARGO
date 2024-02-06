import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <p style={{ padding: 24, textAlign: 'center', width: '100%' }}>Something went wrong</p>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundaryHoc = Component => props => {
  return (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export const ErrorBoundaryHocWithRef = Component =>
  React.forwardRef((props, ref) => {
    return (
      <ErrorBoundary>
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    );
  });
