const Joi = require('joi')
const configs = require('../../configs/config')
const redirPath = require('../../constant/redirectPath')

async function init(req, res, next) {
	res.locals.baseUrl = configs.get('baseUrl:core')
	res.locals.path = redirPath.KURIR[req.path]
	res.locals.headers = {'api-token': configs.get('credentials:core')}
	if (res.locals.path) {
		next()
	} else {
		res.status(404)
		res.send({
			message: 'Invalid path'
		})
		res.locals.response.rd = 'path not found'
	}
}
/* ==================== schema ==================== */
const schemaCekOngkir = Joi.object().keys({
	origin: Joi.object().keys({
		address: Joi.string().required(),
		detailAddress: Joi.string().required().allow('',null),
		senderName: Joi.string().required(),
		senderPhone: Joi.string().required(),
		senderPlaceName: Joi.string().required().allow('',null),
		cityCode: Joi.number().required(),
		cityName: Joi.string().required(),
		pickupPoint: Joi.object().keys({
			latitude: Joi.number().required(),
			longitude: Joi.number().required(),
		}).required(),
		additionalInfoOrigin: Joi.string().allow('',null),
	}).required(),
	destinations: Joi.array().items(
		Joi.object().keys({
			category: Joi.string().required(),
			name: Joi.string().required(),
			description: Joi.string().required().allow('',null),
			quantity: Joi.number().required(),
			deliveryAddress: Joi.string().required(),
			deliveryAddressDetail: Joi.string().required().allow('',null),
			deliveryNotes: Joi.string().required().allow('',null),
			recepientName: Joi.string().required(),
			recepientPhone: Joi.number().required(),
			recepientPlaces: Joi.string().required(),
			deliveryPoint: Joi.object().keys({
				latitude: Joi.number().required(),
				longitude: Joi.number().required(),
			}).required(),
			additionalInfoDestination: Joi.string().allow('',null),
		}).required(),
	).required(),
	vehicleType: Joi.string().required(),
	serviceType: Joi.string().required(),
	additionalInfo: Joi.object().keys({
		extraInfo: Joi.string().allow('',null),
		extraInfo2: Joi.string().allow('',null),
		location: Joi.string().required(),
		versionPartner: Joi.string().required(),
		viaPartner: Joi.string().required(),
	}),
})

const schemaOrder = Joi.object().keys({
	idShipping: Joi.number().required(),
	cityCode: Joi.number().required(),
	additionalInfo: Joi.object().keys({
		extraInfo: Joi.string().allow('',null),
		extraInfo2: Joi.string().allow('',null),
		location: Joi.string().required(),
		versionPartner: Joi.string().required(),
		viaPartner: Joi.string().required(),
	}),
})

/* ====================== request ====================== */
async function reqCekOngkir(req, res, next) {
	const validate = schemaCekOngkir.validate(req.input);
	if (validate.error) {
		res.locals.status = 200
    res.locals.response.rd = 'validate fail'
		res.locals.response.data = {message: validate.error.details[0].message}
		res.status(res.locals.status).send(res.locals.response.data)
		return
	};
	let destinations = []
	res.locals.method = 'POST'
	req.input.destinations.forEach( (e,i) => {
		destinations.push({
			alamat_pengiriman: e.deliveryAddress,
			catatan_barang: e.deliveryNotes,
			deskripsi_barang: e.description,
			detail_lokasi_pengiriman: e.deliveryAddressDetail,
			jenis_barang: e.category,
			nama_penerima: e.recepientName,
			nama_tempat_pengiriman: e.recepientPlaces,
			no_telp: e.recepientPhone,
			qty_barang: e.quantity,
			starting_point: `${req.input.origin.pickupPoint.latitude},${req.input.origin.pickupPoint.longitude}`,
			titik_pengiriman: `${e.deliveryPoint.latitude},${e.deliveryPoint.longitude}`,
			// urutan_pengiriman: i+1,
			// waktu_tempuh: 0
		})
	})
	res.locals.input = {
		alamat_lokasi: req.input.origin.address,
		alamat_penjemputan: req.input.origin.address,
		destination: [...destinations],
		detail_lokasi: req.input.origin.detailAddress,
		detail_lokasi_penjemputan: req.input.origin.detailAddress,
		id_jenis_layanan: 2,
		id_kota: req.input.origin.cityCode,
		// id_promo: 2725,
		// id_transaksi: 25243882,
		jenis_pembayaran: 1,
		nama_kota: req.input.origin.cityName,
		nama_lokasi: req.input.origin.senderPlaceName,
		nama_pengirim: req.input.origin.senderName,
		nama_tempat_penjemputan: req.input.origin.address,
		no_hp_pengirim: req.input.origin.senderPhone,
		origin: `${req.input.origin.pickupPoint.latitude},${req.input.origin.pickupPoint.longitude}`,
		primary_credential: {
			is_partner: true,
			id_kota: req.input.origin.cityCode,
			id_user: res.locals.partnerId,
			location: req.input.additionalInfo.location,
			uuid: res.locals.requestIdPartner,
			version_code: configs.get('VERSION'),
			version_name: res.locals.version_name,
			via: configs.get('APPID')
		},
		reff_id_user_partner: res.locals.partnerId,
		titik_penjemputan: `${req.input.origin.pickupPoint.latitude},${req.input.origin.pickupPoint.longitude}`
	}
	next()
}

async function reqOrder(req, res, next) {
	const validate = schemaOrder.validate(req.input);
	if (validate.error) {
		res.locals.status = 200
    res.locals.response.rd = 'validate fail'
		res.locals.response.data = {message: validate.error.details[0].message}
		res.status(res.locals.status).send(res.locals.response.data)
		return
	};

	res.locals.method = 'POST'
	res.locals.input = {
    reff_id_user_partner: res.locals.partnerId,
    id_ongkos_kirim: req.input.idShipping,
    id_jenis_layanan: 2,
    id_jenis_pembayaran: 1,
    id_kota: req.input.cityCode,
    primary_credential: {
			is_partner: true,
			id_kota: req.input.cityCode,
			id_user: res.locals.partnerId,
			location: req.input.additionalInfo.location,
			uuid: res.locals.requestIdPartner,
			version_code: configs.get('VERSION'),
			version_name: res.locals.version_name,
			via: configs.get('APPID')
		},
	}
	next()
}
/* ===================== response ====================== */
async function respCekOngkir(req, res, next) {
	let response
	if (res.locals.response.data) {
		if (res.locals.response.data.code == 200 && typeof res.locals.response.data.data === 'object') {
			let data = res.locals.response.data.data
			let latlon = data.titik_penjemputan.split(",")
			let destinations = []
			data.destinations.forEach( e => {
				let titikPengiriman = e.titik_pengiriman.split(",")
				destinations.push({
					name: e.jenis_barang,
					description: e.deskripsi_barang,
					quantity: e.qty_barang,
					deliveryAddress: e.alamat_pengiriman,
					deliveryAddressDetail: e.detail_lokasi_pengiriman,
					deliveryNotes: e.catatan_barang,
					recepientName: e.nama_penerima,
					recepientPhone: e.no_telp,
					recepientPlaces: e.nama_tempat_pengiriman,
					deliveryPoint: {
						latitude: titikPengiriman[0],
						longitude: titikPengiriman[1]
					},
					additionalInfoDestination: null,
				})
			})
			response = {
				responseCode: 200,
				detailShippingCost: {
					idShipping: data.id_ongkir,
					grandTotal: data.total,
					senderName: data.nama_pengirim,
					senderPhone: data.no_hp_pengirim,
					distance: data.jarak,
					minDistanceCost: data.rincian.biaya_ongkir_minimal,
					minCost: data.rincian.biaya_ongkir_normal,
					platformFee: data.rincian.biaya_layanan,
					totalDestination: data.destinations.length,
					currency: 'IDR'
				},
				origin: {
					address: data.nama_tempat_penjemputan || data.alamat_penjemputan,
					detailAddress: data.detail_lokasi_penjemputan,
					senderName: data.nama_pengirim,
					senderPhone: data.no_hp_pengirim,
					senderPlaceName: res.locals.input.origin.senderPlaceName,
					cityCode: data.id_kota,
					cityName: data.nama_kota,
					pickupPoint: {
						latitude: latlon[0],
						longitude: latlon[1]
					},
					additionalInfoOrigin: null,
				},
				destinations: [...destinations],
				additionalInfo: req.input.additionalInfo,
			}
		}
		if (res.locals.response.data.code !== 200) res.locals.status = res.locals.response.data.code;
		if (res.locals.response.data.code == 400) response = {
			message: res.locals.response.data.data
		}
		if (res.locals.response.data.status == 500) {
			res.locals.status = 500
			response = {
				message: res.locals.response.data.message
			}
		}
		res.locals.response = {
			mid: res.locals.response.mid,
			rd: res.locals.response.data.message,
			data: response
		}
	}
	next()
}

async function respOrder(req, res, next) {
	console.log(res.locals.response.data)
	if (res.locals.response.data) {
		if (res.locals.response.data.code !== 200) res.locals.status = res.locals.response.data.status;
		if (res.locals.response.data.code == 400) {
			res.locals.status = 400
			res.locals.response.data.data = {
				message: res.locals.response.data.data
			}
		}
		if (res.locals.response.data.status == 500) {
			res.locals.status = 500
			res.locals.response.data.data = {
				message: res.locals.response.data.message
			}
		}
		res.locals.response = {
			mid: res.locals.response.mid,
			rd: res.locals.response.data.message,
			data: res.locals.response.data.data
		}
	}
	next()
}

module.exports = {
	init,
/* request */
	reqCekOngkir,
	reqOrder,
/* response */
	respCekOngkir,
	respOrder,
}