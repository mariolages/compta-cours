import React from 'react';

export const FileTableHeader = () => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Nom du fichier
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Matière
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Catégorie
        </th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Date
        </th>
        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};