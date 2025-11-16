import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import registerRoute from "./routes/auth/register/route";
import loginRoute from "./routes/auth/login/route";
import createOrderRoute from "./routes/orders/create/route";
import getUserOrdersRoute from "./routes/orders/getUserOrders/route";
import getOrderRoute from "./routes/orders/getOrder/route";
import getAvailableOrdersRoute from "./routes/orders/getAvailableOrders/route";
import updateOrderStatusRoute from "./routes/orders/updateStatus/route";
import createOfferRoute from "./routes/offers/create/route";
import getOrderOffersRoute from "./routes/offers/getOrderOffers/route";
import getOrderMessagesRoute from "./routes/messages/getOrderMessages/route";
import sendMessageRoute from "./routes/messages/send/route";
import createReviewRoute from "./routes/reviews/create/route";
import getUserRoute from "./routes/users/getUser/route";
import registerPartnerRoute from "./routes/partners/register/route";
import getPartnerProfileRoute from "./routes/partners/getProfile/route";
import updatePartnerProfileRoute from "./routes/partners/updateProfile/route";
import createServiceRoute from "./routes/partners/services/create/route";
import getAllServicesRoute from "./routes/partners/services/getAll/route";
import updateServiceRoute from "./routes/partners/services/update/route";
import getPartnerOrdersRoute from "./routes/partners/orders/getAll/route";
import getPartnerOrderByIdRoute from "./routes/partners/orders/getById/route";
import acceptOrderRoute from "./routes/partners/orders/accept/route";
import rejectOrderRoute from "./routes/partners/orders/reject/route";
import updatePartnerOrderStatusRoute from "./routes/partners/orders/updateStatus/route";
import uploadOrderPhotoRoute from "./routes/partners/photos/upload/route";
import getOrderPhotosRoute from "./routes/partners/photos/getByOrder/route";
import getPartnerFinancesRoute from "./routes/partners/finances/getAll/route";
import getAllPartnersRoute from "./routes/partners/getAllPartners/route";
import registerCourierRoute from "./routes/couriers/register/route";
import getCourierProfileRoute from "./routes/couriers/getProfile/route";
import updateCourierProfileRoute from "./routes/couriers/updateProfile/route";
import getCourierDeliveriesRoute from "./routes/couriers/deliveries/getAll/route";
import acceptDeliveryRoute from "./routes/couriers/deliveries/accept/route";
import updateDeliveryStatusRoute from "./routes/couriers/deliveries/updateStatus/route";
import createDeliveryRoute from "./routes/couriers/deliveries/create/route";
import getCourierFinancesRoute from "./routes/couriers/finances/getAll/route";
import getAvailableCouriersRoute from "./routes/couriers/getAvailable/route";
import getOrderHistoryRoute from "./routes/orderHistory/get/route";
import getPartnersRoute from "./routes/communication/getPartners/route";
import getCouriersRoute from "./routes/communication/getCouriers/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    register: registerRoute,
    login: loginRoute,
  }),
  orders: createTRPCRouter({
    create: createOrderRoute,
    getUserOrders: getUserOrdersRoute,
    getOrder: getOrderRoute,
    getAvailableOrders: getAvailableOrdersRoute,
    updateStatus: updateOrderStatusRoute,
  }),
  offers: createTRPCRouter({
    create: createOfferRoute,
    getOrderOffers: getOrderOffersRoute,
  }),
  messages: createTRPCRouter({
    getOrderMessages: getOrderMessagesRoute,
    send: sendMessageRoute,
  }),
  reviews: createTRPCRouter({
    create: createReviewRoute,
  }),
  users: createTRPCRouter({
    getUser: getUserRoute,
  }),
  partners: createTRPCRouter({
    register: registerPartnerRoute,
    getProfile: getPartnerProfileRoute,
    updateProfile: updatePartnerProfileRoute,
    getAllPartners: getAllPartnersRoute,
    services: createTRPCRouter({
      create: createServiceRoute,
      getAll: getAllServicesRoute,
      update: updateServiceRoute,
    }),
    orders: createTRPCRouter({
      getAll: getPartnerOrdersRoute,
      getById: getPartnerOrderByIdRoute,
      accept: acceptOrderRoute,
      reject: rejectOrderRoute,
      updateStatus: updatePartnerOrderStatusRoute,
    }),
    photos: createTRPCRouter({
      upload: uploadOrderPhotoRoute,
      getByOrder: getOrderPhotosRoute,
    }),
    finances: createTRPCRouter({
      getAll: getPartnerFinancesRoute,
    }),
  }),
  couriers: createTRPCRouter({
    register: registerCourierRoute,
    getProfile: getCourierProfileRoute,
    updateProfile: updateCourierProfileRoute,
    getAvailable: getAvailableCouriersRoute,
    deliveries: createTRPCRouter({
      getAll: getCourierDeliveriesRoute,
      accept: acceptDeliveryRoute,
      updateStatus: updateDeliveryStatusRoute,
      create: createDeliveryRoute,
    }),
    finances: createTRPCRouter({
      getAll: getCourierFinancesRoute,
    }),
  }),
  orderHistory: createTRPCRouter({
    get: getOrderHistoryRoute,
  }),
  communication: createTRPCRouter({
    getCouriers: getCouriersRoute,
    getPartners: getPartnersRoute,
  }),
});

export type AppRouter = typeof appRouter;
