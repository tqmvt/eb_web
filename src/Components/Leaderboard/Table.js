import React from 'react';
import { shortAddress } from '../../utils';
import { utils } from 'ethers';

export default function Table({ headers, items }) {
  return (
    <table className="table table-dark table-borderless">
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
                {key === 'address' ? shortAddress(item[key]) : utils.commify(item[key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
