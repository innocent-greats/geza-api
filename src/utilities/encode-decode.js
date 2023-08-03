import {IdGenerator, IdEncoder} from 'bnid';

// 64 bit random id generator
export const IDGenerator = new IdGenerator({
  bitLength: 64
});

// base58, multibase, fixed-length encoder
export const IDEncoder = new IdEncoder({
  encoding: 'base58',
  fixedLength: true,
  multibase: true
});