import assert from 'node:assert/strict';
import test from 'node:test';
import { ReportModel } from './report.model';

test('report model rejects invalid latitude > 90', () => {
  const doc = new ReportModel({
    title: 'Pothole on 5th Ave',
    description: 'Large pothole affecting traffic lane',
    category: 'INFRASTRUCTURE',
    location: {
      type: 'Point',
      coordinates: [3.4, 91],
    },
    media_urls: [],
  });

  const error = doc.validateSync();
  assert.ok(error);
  assert.ok(
    Boolean(error?.errors['location.coordinates']),
    'expected location.coordinates validation error',
  );
});
