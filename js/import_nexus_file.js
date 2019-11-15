/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 15.11.2019
 */
const hdf5 = require('hdf5').hdf5;

const Access = require('hdf5/lib/globals').Access;

(function(input) {
    const file = new hdf5.File(input, Access.ACC_RDONLY);
    const group = file.openGroup('entry');
    debugger
})('beamtimedb/syn001_35R_Ti_8w_000_nexus.h5');
