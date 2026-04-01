/**
 * CraneApp Contacts Hook
 * Contact management + search + sync
 */

export function useContacts() {
  const contacts = {
    list: [],
    isLoading: false,
    searchQuery: ''
  };

  // Load contacts from device/cache/API
  async function loadContacts() {
    contacts.isLoading = true;
    
    try {
      // Mock data + device contacts API
      if (navigator.contacts) {
        const deviceContacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
        contacts.list = deviceContacts.map(contact => ({
          id: Date.now() + Math.random(),
          name: contact.name[0],
          phone: contact.tel[0]?.[0] || '',
          username: null,
          online: false
        }));
      } else {
        // Fallback mock data
        contacts.list = [
          { id: 1, name: 'Alice Johnson', username: '@alice_j', phone: '+7 999 123-45-67', online: true },
          { id: 2, name: 'Bob Wilson', username: '@bob_wilson', phone: '+7 999 987-65-43', online: false },
          { id: 3, name: 'Carol Davis', username: '@carol_d', phone: '+7 999 555-12-34', online: true }
        ];
      }
      
      window.contactsData = contacts.list;
      window.dispatchEvent(new CustomEvent('contacts:loaded'));
      
    } finally {
      contacts.isLoading = false;
    }
  }

  // Search contacts
  function searchContacts(query) {
    contacts.searchQuery = query;
    const filtered = contacts.list.filter(contact =>
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.username?.toLowerCase().includes(query.toLowerCase()) ||
      contact.phone.includes(query)
    );
    return filtered;
  }

  // Add contact
  async function addContact(contactData) {
    const newContact = {
      id: Date.now(),
      ...contactData,
      online: false
    };
    contacts.list.unshift(newContact);
    window.dispatchEvent(new CustomEvent('contacts:updated'));
    return newContact;
  }

  // Socket events (online/offline status)
  function initSocketEvents() {
    window.addEventListener('socket:user-online', (e) => {
      const contact = contacts.list.find(c => c.id == e.detail.userId);
      if (contact) {
        contact.online = true;
        window.dispatchEvent(new CustomEvent('contacts:updated'));
      }
    });

    window.addEventListener('socket:user-offline', (e) => {
      const contact = contacts.list.find(c => c.id == e.detail.userId);
      if (contact) {
        contact.online = false;
        window.dispatchEvent(new CustomEvent('contacts:updated'));
      }
    });
  }

  // Initialize
  loadContacts();
  initSocketEvents();

  window.ContactProvider = {
    loadContacts,
    searchContacts,
    addContact,
    state: contacts
  };

  return {
    contacts: () => contacts.list,
    isLoading: () => contacts.isLoading,
    searchContacts,
    loadContacts,
    addContact
  };
}
