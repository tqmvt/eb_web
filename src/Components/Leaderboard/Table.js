import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {relativePrecision, round, shortAddress} from '../../utils';
import { utils } from 'ethers';
import { getCnsName } from '../../helpers/cns';
import styles from './styles.module.scss';

export default function Table({ headers, items }) {
  const userTheme = useSelector((state) => {
    return state.user.theme;
  });
  return (
    <table className={`table ${styles.table} table-${userTheme} table-borderless`}>
      <thead className="border-bottom">
        <tr>
          <th scope="col" className="text-center">
            Rank
          </th>
          {headers?.map((header, index) => (
            <th scope="col" key={index} className="text-center">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items?.map((item, index) => (
          <tr key={index}>
            <th scope="row" className="text-center">
              {index + 1}
            </th>
            {Object.keys(item).map((key) => (
              <td key={key} className="text-center">
                {key === 'address' ? <UserName address={item[key]} /> : utils.commify(round(item[key]))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function UserName({ address }) {
  const [name, setName] = useState(shortAddress(address));

  useEffect(() => {
    async function func() {
      const cnsName = await getCnsName(address);
      if (cnsName) setName(cnsName);
    }

    func();
  }, [address]);

  return <>{name}</>;
}
