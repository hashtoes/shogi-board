import React from 'react';
import classnames from 'classnames';
import Koma from './Koma';
import KomaObj from './domain/Koma';
import styles from './Mochigoma.module.scss';

interface Props {
  komas: KomaObj[];
}

const Mochigoma: React.FC<Props> = ({ komas }) => {
  return (
    <div className={classnames(styles.mochigoma, {
      [styles.sente]: komas.some(k => k.isSente()),
    })}>
      {(komas).map((koma) => <Koma key={koma.id} koma={koma} />)}
    </div>
  );
}

export default Mochigoma;
