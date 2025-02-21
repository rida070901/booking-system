

export const environment = {

  production: true,

  apiUrl: 'https://booking-api.asystems.al/api',

  endpoints: {
    auth: {
      login: '/Authentication/Login',
      register: '/Authentication/Register',
    },
    bookings: {
      getByRoom: (roomId: number) => `/Bookings/${roomId}`,
      getByUser: (userId: string) => `/Bookings/User/${userId}`,
    },
    guestHouse: {
      getAll: '/GuestHouse',
      getById: (id: number) => `/GuestHouse/${id}`,
      create: '/GuestHouse',
      update: (id: number) => `/GuestHouse/${id}`,
      delete: (id: number) => `/GuestHouse/${id}`,
      topFive: '/GuestHouse/top-five',
    },
    room: {
      getByGuestHouse: (id: number) => `/Room/GuestHouse/${id}`,
      getById: (id: number) => `/Room/${id}`,
      create: '/Room',
      update: (id: number) => `/Room/${id}`,
      delete: (id: number) => `/Room/${id}`,
      book: '/Room/Book',
    },
    users: {
      getAll: '/Users',
      getById: (id: string) => `/Users/${id}`,
      update: (id: string) => `/Users/${id}`,
    },
  },

};


